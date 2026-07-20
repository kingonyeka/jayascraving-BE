export declare enum SettingType {
    STRING = "STRING",
    NUMBER = "NUMBER",
    BOOLEAN = "BOOLEAN",
    JSON = "JSON"
}
export declare class Setting {
    id: string;
    key: string;
    value: string;
    type: SettingType;
    label: string;
    description?: string;
    group?: string;
    isSecret: boolean;
    isEditable: boolean;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
