export function setRating(el, attribute, childClass) {
	const ratingValue = parseFloat(el.getAttribute(attribute)) || 0

	const childEl = el.querySelector(childClass)

	if (ratingValue) {
		if (childEl) {

			childEl.style.width = `${ratingValue / 0.049555}% `
			// це все лажа
		}
	} else {
		el.style.opacity = 0.4
	}
}

// const widthPercentage = (ratingValue / 5) * (totalWidth + 5);