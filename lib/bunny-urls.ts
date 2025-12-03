/**
 * Bunny.net Stream URL Builder
 * 
 * Centraliza toda a lógica de construção de URLs do Bunny Stream
 * para garantir consistência e facilitar manutenção.
 */

export interface BunnyVideoInfo {
  guid: string;
  videoLibraryId: number;
  thumbnailFileName?: string;
  availableResolutions?: string;
  status: number;
  length: number;
  width?: number;
  height?: number;
  title?: string;
  storageZoneName?: string;
}

export class BunnyUrlBuilder {
  private libraryId: string;
  
  constructor(libraryId: string) {
    this.libraryId = libraryId;
  }
  
  /**
   * Gera URL do HLS playlist
   * Formato: https://vz-{libraryId}.b-cdn.net/{videoId}/playlist.m3u8
   */
  getHlsUrl(videoId: string): string {
    return `https://vz-${this.libraryId}.b-cdn.net/${videoId}/playlist.m3u8`;
  }
  
  /**
   * Gera URL do thumbnail
   * Formato: https://vz-{libraryId}.b-cdn.net/{videoId}/{thumbnailFileName}
   */
  getThumbnailUrl(videoId: string, thumbnailFileName?: string): string | null {
    if (!thumbnailFileName) return null;
    return `https://vz-${this.libraryId}.b-cdn.net/${videoId}/${thumbnailFileName}`;
  }
  
  /**
   * Gera URL do embed iframe
   * Formato: https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}
   */
  getEmbedUrl(videoId: string): string {
    return `https://iframe.mediadelivery.net/embed/${this.libraryId}/${videoId}`;
  }
  
  /**
   * Gera URLs de MP4 para diferentes resoluções
   * Formato: https://vz-{libraryId}.b-cdn.net/{videoId}/play_{resolution}.mp4
   */
  getMp4Urls(videoId: string, availableResolutions?: string): Array<{ quality: string; url: string }> {
    if (!availableResolutions) return [];
    
    return availableResolutions.split(',').map(resolution => ({
      quality: resolution.trim(),
      url: `https://vz-${this.libraryId}.b-cdn.net/${videoId}/play_${resolution.trim()}.mp4`
    }));
  }
  
  /**
   * Gera URL com token de autenticação
   * Adiciona parâmetros token e expires à URL
   */
  getAuthenticatedUrl(baseUrl: string, token: string, expires: number): string {
    const url = new URL(baseUrl);
    url.searchParams.set('token', token);
    url.searchParams.set('expires', expires.toString());
    return url.toString();
  }
  
  /**
   * Gera preview URL (para thumbnail em diferentes tamanhos)
   * Formato: https://vz-{libraryId}.b-cdn.net/{videoId}/preview.webp
   */
  getPreviewUrl(videoId: string, width?: number, height?: number): string {
    const baseUrl = `https://vz-${this.libraryId}.b-cdn.net/${videoId}/preview.webp`;
    if (!width && !height) return baseUrl;
    
    const url = new URL(baseUrl);
    if (width) url.searchParams.set('width', width.toString());
    if (height) url.searchParams.set('height', height.toString());
    return url.toString();
  }
}

/**
 * Função auxiliar para criar o builder com configuração padrão
 */
export function createBunnyUrlBuilder(libraryId?: string): BunnyUrlBuilder {
  const id = libraryId || process.env.BUNNY_LIBRARY_ID;
  if (!id) {
    throw new Error('BUNNY_LIBRARY_ID is not defined');
  }
  return new BunnyUrlBuilder(id);
}

