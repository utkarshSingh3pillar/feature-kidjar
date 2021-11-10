export interface CreateUser {
    logins: Login[]
    phone_numbers: string[]
    legal_names: string[]
    documents: Document[]
    extra: any
}

export interface AddUserKYC {
    documents: Document[]
}

export interface Login {
    email: string
}

export interface Document {
    email: string
    phone_number: string
    ip: string
    name: string
    alias?: string
    docs_key: string
    entity_type: string
    entity_scope: string
    day: number
    month: number
    year: number
    address_street: string
    address_city: string
    address_subdivision: string
    address_postal_code: string
    address_country_code: string
    virtual_docs?: VirtualDoc[]
    physical_docs?: PhysicalDoc[]
    social_docs?: SocialDoc[]
}

export interface VirtualDoc {
    document_value: string
    document_type: string
}

export interface PhysicalDoc {
    document_value: string
    document_type: string
}

export interface SocialDoc {
    document_value: string
    document_type: string
}

export interface Extra {
    supp_id: string
    cip_tag: number
    is_business: boolean
}

export interface LinkedBankAccountInfo {
    account_num: string;
    routing_num: string;
    type: string;
    class: string;
}
