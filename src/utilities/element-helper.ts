export class ElementUtility {
    static getElementId(target: EventTarget) {
        const isElement = target instanceof Element;
        if (!isElement) return null;
        const element = target as Element;
        const classListStr = element.className.replace(' ', '.');
        const name = `${element.tagName}${element.id ? '#' : ''}${element.id || ''}${classListStr ? '.' : ''}${classListStr || ''}`;

        const elements = document.querySelectorAll(name);
        if (elements.length === 1) return name;
        else this.getShortestUniqueId(name, element, elements);
        return ``;
    }

    static getShortestUniqueId(conflictingId: string, element: Element, matches: NodeListOf<Element>) {
        return '';
    }
}