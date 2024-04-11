// "use strict"

import { da } from "./dynamic_adapt.js"

import { setRating } from "./rating.js"
import { spollers } from "./spoilers.js"

import { counter } from "./counter.js"

function checkInit(identifier, className, methodName, parentAtrName) {
	if (!identifier) {
		throw new Error("identifier is not defined")
	}

	let elements
	if (identifier.includes(".")) {
		elements = document.querySelectorAll(identifier)
	} else {
		elements = document.querySelectorAll(`[${identifier}]`)

		if (elements.length && className && methodName) {
			elements.forEach((element) => {
				className[methodName](element, identifier, parentAtrName)
			})
		}
	}

	return elements && elements.length ? elements : null
}

window.onload = () => {
	const icon = document.querySelector(".icon-menu")
	const ratingElements = document.querySelectorAll("[data-rate-value]")

	// Ініціалізація спойлерів
	spollers()
	
	// Ініціалізація анімованих лічильників
	checkInit("data-counter", counter, "observe")

	// BURGER
	icon.addEventListener("click", function () {
		document.documentElement.classList.toggle("menu-open")
	})

	// RATING
	if (ratingElements.length) {
		ratingElements.forEach((el) => setRating(el, "data-rate-value", ".rate__active"))
	}
}
