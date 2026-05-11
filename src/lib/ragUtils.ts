export interface Chunk {
    id: string;
    text: string;
    tokens: number;
    overlap: number;
    embedding?: number[];
    score?: number;
    position?: { x: number; y: number }; // For 2D visualization
}

// Simple chunking algorithm
export const chunkText = (text: string, chunkSize: number = 200, overlap: number = 20): Chunk[] => {
    const chunks: Chunk[] = [];
    let start = 0;
    let id = 1;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        const chunkText = text.slice(start, end);
        
        chunks.push({
            id: `chunk-${id++}`,
            text: chunkText,
            tokens: Math.ceil(chunkText.length / 4), // Rough estimation
            overlap: start === 0 ? 0 : overlap,
        });

        if (end === text.length) break;
        start += (chunkSize - overlap);
    }

    return chunks;
};

// Cosine similarity
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    if (!magA || !magB) return 0;
    return dotProduct / (magA * magB);
};

// Simple projection logic for 2D visualization (Random projection for demo purposes as PCA is heavy)
export const projectEmbedding = (embedding: number[]): { x: number; y: number } => {
    // In a real app, I'd use PCA or t-SNE. 
    // Here we use a deterministic "pseudorandom" mapping from high-D to 2D
    // for visualization consistency.
    let x = 0;
    let y = 0;
    const stride = Math.floor(embedding.length / 2);
    
    for (let i = 0; i < stride; i++) {
        x += embedding[i] * (i % 2 === 0 ? 1 : -1);
        y += embedding[i + stride] * (i % 2 === 0 ? -1 : 1);
    }
    
    return { 
        x: Number((x / 5).toFixed(4)), 
        y: Number((y / 5).toFixed(4)) 
    };
};
