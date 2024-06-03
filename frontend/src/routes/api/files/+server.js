import { promises as fs } from 'fs';
import path from 'path';

export const GET = async () => {
    const directoryPath = path.join('/tmp/data');
    
    try {
        // Check if the directory exists, if not, create it
        await fs.mkdir(directoryPath, { recursive: true });
        
        const files = await fs.readdir(directoryPath);
        return new Response(JSON.stringify(files), { status: 200 });
    } catch (error) {
        console.error('Failed to read directory:', error);
        return new Response(`Failed to read directory: ${error.message}`, { status: 500 });
    }
};
