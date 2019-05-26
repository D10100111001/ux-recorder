
import { HtmlDiffChange } from "src/worker/models/interfaces/html-diff-change";

export class HtmlDiffUtility {
    static async diff(source: string, target: string): Promise<HtmlDiffChange> {
        //return diff.createPatch('HTML DIFF', source, target, 'source', 'target');
        return {};
    }
}