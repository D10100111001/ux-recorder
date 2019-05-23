export class ElementUtility {
    static verifyTargetNode(target: EventTarget): Element | Text | null {
        return target instanceof Element || target instanceof Text ? target : null;
    }

    static getElementString(node: Element | Text) {
        if (node == null) return '';

        if (node instanceof Text) return 'text';
        const tagSelector = node.tagName;
        const idSelector = node.id ? `#${node.id}` : '';

        const className = node.getAttribute('class');
        const classNameSelector = className ? `.${className.split(' ').join('.')}` : '';

        const attributes = Array.from(node.attributes)
            .filter(attr =>
                ['class', 'style', 'id'].indexOf(attr.name) === -1)
            .map(attr => `${attr.name}${attr.value ? `=${attr.value}` : ''}`)
            .join('][');
        const attributesSelector = attributes ? `[${attributes}]` : '';

        return [tagSelector, idSelector, classNameSelector, attributesSelector].join('');
    }

    static nodeToHtml(node: Element | Text) {
        return node instanceof Text ? `<text>${node.textContent}</text>` : node.outerHTML;
    }

    static getNodeIndex(node: Node | null) {
        if (!node) return null;
        let index = 0;
        while ((node = node.previousSibling))
            index++;
        return index;
    }

    static getXPath(node: Element | Text) {
        if (node == null) return '';
        const idx = (sib: Element, name?: string) => sib
            ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name)
            : 1;
        const segs = elm => !elm || elm.nodeType !== 1
            ? ['']
            : elm.id && document.getElementById(elm.id) === elm
                ? [`id("${elm.id}")`]
                : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm)}]`];
        return segs(node).join('/');
    }

    static lookupElementByXPath(path: string) {
        var evaluator = new XPathEvaluator();
        var result = evaluator.evaluate(path, document.documentElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue;
    }
}