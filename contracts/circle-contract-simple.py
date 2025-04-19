# circle-contract-simple.py
from pyteal import (
    App, Bytes, Int, Seq, Return, Assert, Cond, 
    Txn, Global, Btoi, Gtxn, TxnType, TxnField, 
    InnerTxnBuilder, OnComplete, TealType, Subroutine,
    compileTeal, Mode, Balance, ScratchVar
)

def approval_program():
    # Global state variables
    global_circle_name = Bytes("CircleName")
    global_contribution_amount = Bytes("ContributionAmount")
    global_frequency_in_rounds = Bytes("FrequencyInRounds")
    global_member_cap = Bytes("MemberCap")
    global_current_members = Bytes("CurrentMembers")
    global_current_recipient = Bytes("CurrentRecipient")
    global_next_distribution = Bytes("NextDistribution")
    global_emergency_fund = Bytes("EmergencyFund")
    global_creator = Bytes("Creator")
    
    # Local state variables (per member)
    local_joined_round = Bytes("JoinedRound")
    local_contributions = Bytes("Contributions")
    local_received_payout = Bytes("ReceivedPayout")
    local_reputation = Bytes("Reputation")
    
    # Scratch variables for temporary values
    emergency_amount_var = ScratchVar(TealType.uint64)
    distribution_amount_var = ScratchVar(TealType.uint64)
    recipient_account_var = ScratchVar(TealType.bytes)
    next_recipient_var = ScratchVar(TealType.bytes)
    withdrawal_amount_var = ScratchVar(TealType.uint64)
    recipient_var = ScratchVar(TealType.bytes)

    # Create a new savings circle - ONLY set global state here, no local state updates
    on_create = Seq([
        App.globalPut(global_circle_name, Txn.application_args[1]),
        App.globalPut(global_contribution_amount, Btoi(Txn.application_args[2])),
        App.globalPut(global_frequency_in_rounds, Btoi(Txn.application_args[3])),
        App.globalPut(global_member_cap, Btoi(Txn.application_args[4])),
        App.globalPut(global_current_members, Int(1)),  # Creator is first member
        App.globalPut(global_current_recipient, Txn.sender()),
        App.globalPut(global_next_distribution, Global.round() + Btoi(Txn.application_args[3])),
        App.globalPut(global_emergency_fund, Int(0)),
        App.globalPut(global_creator, Txn.sender()),
        
        # NO local state updates here!
        Return(Int(1))
    ])
    
    # Initialize a user's local state - NEW function
    on_initialize_user = Seq([
        App.localPut(Txn.sender(), local_joined_round, Global.round()),
        App.localPut(Txn.sender(), local_contributions, Int(0)),
        App.localPut(Txn.sender(), local_received_payout, Int(0)),
        App.localPut(Txn.sender(), local_reputation, Int(100)),  # Initial perfect reputation
        Return(Int(1))
    ])

    # Join an existing circle
    on_join_circle = Seq([
        Assert(App.globalGet(global_current_members) < App.globalGet(global_member_cap)),
        App.globalPut(global_current_members, App.globalGet(global_current_members) + Int(1)),
        App.localPut(Txn.sender(), local_joined_round, Global.round()),
        App.localPut(Txn.sender(), local_contributions, Int(0)),
        App.localPut(Txn.sender(), local_received_payout, Int(0)),
        App.localPut(Txn.sender(), local_reputation, Int(100)),
        Return(Int(1))
    ])

    # Make a contribution to the circle
    on_contribute = Seq([
        Assert(Gtxn[1].type_enum() == TxnType.Payment),
        Assert(Gtxn[1].amount() == App.globalGet(global_contribution_amount)),
        Assert(Gtxn[1].receiver() == Global.current_application_address()),
        App.localPut(
            Txn.sender(), 
            local_contributions, 
            App.localGet(Txn.sender(), local_contributions) + Int(1)
        ),
        emergency_amount_var.store(Gtxn[1].amount() / Int(10)),
        App.globalPut(
            global_emergency_fund, 
            App.globalGet(global_emergency_fund) + emergency_amount_var.load()
        ),
        App.localPut(
            Txn.sender(), 
            local_reputation, 
            App.localGet(Txn.sender(), local_reputation) + Int(1)
        ),
        Return(Int(1))
    ])

    # Execute distribution to current recipient
    on_distribute = Seq([
        recipient_account_var.store(App.globalGet(global_current_recipient)),
        Assert(Global.round() >= App.globalGet(global_next_distribution)),
        distribution_amount_var.store(Balance(Global.current_application_address()) - App.globalGet(global_emergency_fund)),
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.amount: distribution_amount_var.load(),
            TxnField.receiver: recipient_account_var.load(),
            TxnField.fee: Int(1000)
        }),
        InnerTxnBuilder.Submit(),
        App.localPut(
            recipient_account_var.load(), 
            local_received_payout, 
            App.localGet(recipient_account_var.load(), local_received_payout) + Int(1)
        ),
        next_recipient_var.store(App.globalGet(global_creator)),  # Simplified logic
        App.globalPut(global_current_recipient, next_recipient_var.load()),
        App.globalPut(
            global_next_distribution, 
            Global.round() + App.globalGet(global_frequency_in_rounds)
        ),
        Return(Int(1))
    ])

    # Handle emergency fund access
    on_emergency_withdraw = Seq([
        Assert(Txn.sender() == App.globalGet(global_creator)),
        withdrawal_amount_var.store(Btoi(Txn.application_args[1])),
        recipient_var.store(Txn.accounts[1]),
        Assert(withdrawal_amount_var.load() <= App.globalGet(global_emergency_fund)),
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.amount: withdrawal_amount_var.load(),
            TxnField.receiver: recipient_var.load(),
            TxnField.fee: Int(1000)
        }),
        InnerTxnBuilder.Submit(),
        App.globalPut(
            global_emergency_fund, 
            App.globalGet(global_emergency_fund) - withdrawal_amount_var.load()
        ),
        Return(Int(1))
    ])
    
    # Route calls based on method name
    method = Txn.application_args[0]
    router = Cond(
        [method == Bytes("createCircle"), on_create],
        [method == Bytes("initializeUser"), on_initialize_user],
        [method == Bytes("joinCircle"), on_join_circle],
        [method == Bytes("contribute"), on_contribute],
        [method == Bytes("distribute"), on_distribute],
        [method == Bytes("emergencyWithdraw"), on_emergency_withdraw]
    )

    # Main contract logic
    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Txn.sender() == App.globalGet(global_creator))],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Txn.sender() == App.globalGet(global_creator))],
        [Txn.on_completion() == OnComplete.CloseOut, Return(Int(1))],
        [Txn.on_completion() == OnComplete.OptIn, Return(Int(1))],
        [Txn.on_completion() == OnComplete.NoOp, router]
    )

    return program

def clear_state_program():
    return Return(Int(1))

if __name__ == "__main__":
    with open("simple_approval.teal", "w") as f:
        f.write(compileTeal(approval_program(), mode=Mode.Application, version=6))
    
    with open("simple_clear_state.teal", "w") as f:
        f.write(compileTeal(clear_state_program(), mode=Mode.Application, version=6))