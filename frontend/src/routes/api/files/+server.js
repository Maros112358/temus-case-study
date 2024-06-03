import { promises as fs } from 'fs';
import path from 'path';

export const GET = async () => {
    const directoryPath = path.join(process.cwd(), 'data');
    
    try {
        const files = await fs.readdir(directoryPath);
        return new Response(JSON.stringify(files), { status: 200 });
    } catch (error) {
        console.error('Failed to read directory:', error);
        return new Response('Failed to read directory', { status: 500 });
    }
};
