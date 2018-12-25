import html2Canvas from 'html2canvas';

export class ScreenshotUtility {
    constructor() {}
    
    private getCanvas(element: HTMLElement) {
        return new Promise<HTMLCanvasElement>(resolve => 
            html2Canvas(element)
                .then((canvas) => resolve(canvas)));
    }

    async capture(element: HTMLElement = document.documentElement) {
        const canvas = await this.getCanvas(element);
        const screenshotDataUrl = canvas.toDataURL("image/png");
        return screenshotDataUrl.split(',').pop();
    }
}