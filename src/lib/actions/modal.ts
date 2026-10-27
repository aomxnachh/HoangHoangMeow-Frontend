// Keep dialogs relative to the viewport, outside animated page containers.
const openModals: HTMLElement[] = [];
let previousOverflow = '';

export function modal(node: HTMLElement) {
	const previousFocus = document.activeElement as HTMLElement | null;
	if (!openModals.length) {
		previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
	}
	openModals.push(node);
	node.classList.add('responsive-modal');
	document.body.appendChild(node);
	const focusable = () => Array.from(node.querySelectorAll<HTMLElement>(
		'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
	)).filter(element => element.getClientRects().length > 0);
	// Focus the panel instead of opening the mobile keyboard automatically.
	const panel = node.querySelector<HTMLElement>('[role="dialog"]') ?? node.querySelector<HTMLElement>(':scope > div:not(.absolute)');
	if (panel) {
		panel.tabIndex = -1;
		panel.focus({ preventScroll: true });
	}
	function trapFocus(event: KeyboardEvent) {
		if (openModals.at(-1) !== node || event.key !== 'Tab') return;
		const elements = focusable();
		const first = elements[0];
		const last = elements.at(-1);
		if (!first || !last) { event.preventDefault(); return; }
		if (event.shiftKey && (!elements.includes(document.activeElement as HTMLElement) || document.activeElement === first)) {
			event.preventDefault(); last.focus();
		} else if (!event.shiftKey && (!elements.includes(document.activeElement as HTMLElement) || document.activeElement === last)) {
			event.preventDefault(); first.focus();
		}
	}
	document.addEventListener('keydown', trapFocus);
	return { destroy() {
		document.removeEventListener('keydown', trapFocus);
		openModals.splice(openModals.indexOf(node), 1);
		if (!openModals.length) document.body.style.overflow = previousOverflow;
		node.remove();
		if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
	} };
}
