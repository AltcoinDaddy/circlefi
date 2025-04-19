# deploy_mainnet.py - final fixed version
import json
import base64
import os
import time
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk import transaction

# Define the path to your TEAL files
script_dir = os.path.dirname(os.path.abspath(__file__))
approval_path = os.path.join(script_dir, "simple_approval.teal")
clear_path = os.path.join(script_dir, "simple_clear_state.teal")

# Load the compiled TEAL files
try:
    with open(approval_path, "r") as f:
        approval_program = f.read()
    print(f"Successfully loaded approval program from {approval_path}")
except FileNotFoundError:
    print(f"ERROR: Could not find approval program at {approval_path}")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Files in current directory: {os.listdir('.')}")
    raise

try:
    with open(clear_path, "r") as f:
        clear_program = f.read()
    print(f"Successfully loaded clear program from {clear_path}")
except FileNotFoundError:
    print(f"ERROR: Could not find clear program at {clear_path}")
    raise

# Connect to Algorand MainNet node
algod_address = "https://mainnet-api.algonode.cloud"
algod_token = ""
algod_client = algod.AlgodClient(algod_token, algod_address)

# Your account
creator_mnemonic = "embody kidney knife mirror expect spend divide estate control party reform comic must mountain mix cheese teach pluck mercy attitude clap mail blame abstract turkey"
creator_private_key = mnemonic.to_private_key(creator_mnemonic)
creator_address = account.address_from_private_key(creator_private_key)
print(f"Using account: {creator_address}")

# Get suggested parameters
params = algod_client.suggested_params()
print(f"Got suggested parameters: {params}")

# Compile the approval program
approval_result = algod_client.compile(approval_program)
approval_program_compiled = base64.b64decode(approval_result["result"])
print("Compiled approval program")

# Compile the clear program
clear_result = algod_client.compile(clear_program)
clear_program_compiled = base64.b64decode(clear_result["result"])
print("Compiled clear program")

# Helper function to encode uint64
def encode_uint64(value):
    return value.to_bytes(8, byteorder='big')

# Define application arguments
circle_name = "CircleFi Initial".encode()
contribution_amount = encode_uint64(100000000)  # 100 ALGO in microALGO
frequency_in_rounds = encode_uint64(30 * 24 * 60 * 4)  # ~30 days worth of blocks
member_cap = encode_uint64(10)  # Maximum 10 members

app_args = [
    b"createCircle",  # Method name
    circle_name,
    contribution_amount,
    frequency_in_rounds,
    member_cap
]

print(f"Application arguments prepared")

# Create unsigned transaction
create_txn = transaction.ApplicationCreateTxn(
    sender=creator_address,
    sp=params,
    on_complete=transaction.OnComplete.NoOpOC,
    approval_program=approval_program_compiled,
    clear_program=clear_program_compiled,
    global_schema=transaction.StateSchema(num_uints=8, num_byte_slices=3),
    local_schema=transaction.StateSchema(num_uints=4, num_byte_slices=0),
    app_args=app_args
)
print("Created application transaction")

# Sign transaction
signed_create_txn = create_txn.sign(creator_private_key)
print("Signed application transaction")

# Submit transaction
try:
    # Step 1: Create the application
    tx_id = algod_client.send_transaction(signed_create_txn)
    print(f"Transaction ID for app creation: {tx_id}")
    
    # Wait for confirmation
    print("Waiting for app creation confirmation...")
    confirmed_txn = None
    
    while True:
        try:
            confirmed_txn = algod_client.pending_transaction_info(tx_id)
            if "confirmed-round" in confirmed_txn and confirmed_txn["confirmed-round"] > 0:
                break
        except:
            pass
        time.sleep(2)  # Wait 2 seconds between checks
    
    app_id = confirmed_txn["application-index"]
    print(f"Created app with ID: {app_id}")
    
    # Step 2: Opt in to the application
    print("Creating opt-in transaction...")
    params = algod_client.suggested_params()  # Refresh parameters WITHOUT .do()
    
    opt_in_txn = transaction.ApplicationOptInTxn(
        sender=creator_address,
        sp=params,
        index=app_id
    )
    
    # Sign opt-in transaction
    signed_opt_in_txn = opt_in_txn.sign(creator_private_key)
    print("Signed opt-in transaction")
    
    # Submit opt-in transaction
    opt_in_tx_id = algod_client.send_transaction(signed_opt_in_txn)
    print(f"Transaction ID for opt-in: {opt_in_tx_id}")
    
    # Wait for opt-in confirmation
    print("Waiting for opt-in confirmation...")
    while True:
        try:
            confirmed_txn = algod_client.pending_transaction_info(opt_in_tx_id)
            if "confirmed-round" in confirmed_txn and confirmed_txn["confirmed-round"] > 0:
                break
        except:
            pass
        time.sleep(2)  # Wait 2 seconds between checks
    
    print(f"Successfully opted in to app ID: {app_id}")
    
    # Step 3: Initialize user state
    print("Creating initialize user transaction...")
    params = algod_client.suggested_params()  # Refresh parameters WITHOUT .do()
    
    init_txn = transaction.ApplicationNoOpTxn(
        sender=creator_address,
        sp=params,
        index=app_id,
        app_args=[b"initializeUser"]
    )
    
    # Sign initialization transaction
    signed_init_txn = init_txn.sign(creator_private_key)
    print("Signed initialization transaction")
    
    # Submit initialization transaction
    init_tx_id = algod_client.send_transaction(signed_init_txn)
    print(f"Transaction ID for initialization: {init_tx_id}")
    
    # Wait for initialization confirmation
    print("Waiting for initialization confirmation...")
    while True:
        try:
            confirmed_txn = algod_client.pending_transaction_info(init_tx_id)
            if "confirmed-round" in confirmed_txn and confirmed_txn["confirmed-round"] > 0:
                break
        except:
            pass
        time.sleep(2)  # Wait 2 seconds between checks
    
    print(f"Successfully initialized user state for app ID: {app_id}")
    
    # Save the App ID to a file
    with open("mainnet_app_id.json", "w") as f:
        json.dump({"app_id": app_id}, f)
        print(f"Saved app ID to mainnet_app_id.json")
    
    print("======================================================")
    print(f"CircleFi application successfully deployed with ID: {app_id}")
    print("======================================================")
    
except Exception as e:
    print(f"Error during deployment: {e}")