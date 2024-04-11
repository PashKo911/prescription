import { Counter, counter } from "./counter.js"

const options = {
	root: null,
	rootMargin: "0px 0px 0px 0px",
	threshold: 0.3, // на скільки відсотків (відсоток від розмірів обʼєкту) обʼкт повинен зʼвитись у вьюпорті для спрацювання
}

const setObClass = (entries, observer) => {
	entries.forEach((entry) => {
		const targetElement = entry.target
		if (entry.isIntersecting) {
			targetElement.classList.add("animate")
		} else targetElement.classList.remove("animate")
	})
}

export const setObFc = (callback, options) => (entries, observer) => {
	entries.forEach((entry) => {
		const targetElement = entry.target
		if (entry.isIntersecting) {
			callback(targetElement, options)
		} else {
			// targetElement.classList.remove("animate")
		}
	})
}


export const observerCl = new IntersectionObserver(setObClass, options)

const param = "data-counter"

export const observerFc = new IntersectionObserver(
	setObFc(counter.counterInit, param),
	options
)
// observer.observe(elements)
