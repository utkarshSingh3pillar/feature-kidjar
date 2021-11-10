export interface CreateSubnet {
    nickname: string
    account_class: string
    preview_only: boolean;
    status: string; //'INACTIVE', 'ACTIVE'
}

export interface ShipCard {
    fee_node_id: string
    expedite: boolean
    card_style_id: string
}
