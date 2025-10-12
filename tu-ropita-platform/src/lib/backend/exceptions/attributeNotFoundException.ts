export class AttributeNotFoundException extends Error {
    public statusCode: number = 404;

    constructor(identifier: string | number) {
        super(`Attribute not found: ${identifier}`);
        this.name = 'AttributeNotFoundException';
    }
}

export class AttributeValueNotFoundException extends Error {
    public statusCode: number = 404;

    constructor(identifier: string | number) {
        super(`Attribute value not found: ${identifier}`);
        this.name = 'AttributeValueNotFoundException';
    }
}
