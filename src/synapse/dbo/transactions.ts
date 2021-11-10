export interface CreateTransaction {
    to: To
    amount: Amount
    extra: Extra
}

export interface To {
    type: string
    id: string
}

export interface Amount {
    amount: number
    currency: string
}

export interface Extra {
    ip: string
    note: string
}
