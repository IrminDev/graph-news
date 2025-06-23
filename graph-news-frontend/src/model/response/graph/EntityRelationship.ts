interface EntityRelationship {
    sourceId: string;
    targetId: string;
    type: string;
    originalType: string;
    confidence: number;
}

export default EntityRelationship;