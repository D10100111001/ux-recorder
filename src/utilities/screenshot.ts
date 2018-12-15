import * as html2Canvas from 'html2canvas';

export class Screenshot {
    constructor() {}
    
    private getCanvas() {
        return new Promise<HTMLCanvasElement>(resolve => 
            html2Canvas(document.documentElement)
                .then((canvas) => resolve(canvas)));
    }

    async capture() {
        const canvas = await this.getCanvas();
        const screenshotDataUrl = canvas.toDataURL("image/png");
        return screenshotDataUrl.split(',').pop();
    }
}