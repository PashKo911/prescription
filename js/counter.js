"use strict"

// Інструкція з використання модулю

// 1) Час виконання анімації в секундах за змовченням = 1s
// 2) Відступ безпеки якщо поруч є текст і його трясе за змовченням = 0
// 3) Якщо є svg анфмація і треба заповнення її не на 100%, вказуємо максимальне значення, за змовченням заповнюється повністю
// 4) Дозволяємо або забороняємо анімації повторюватись при кожному попаданні в зону видимості, за змовченням повторюватись не буде, пишемо будь яке число яке дасть true окрім (17)

// Просто добавляємо необхідний атрибут до вашого коду html і працює як звичайний лічильник
// Приклад запису
//											 1)  2)   3)   4)
/* <span class="rating__text" data-counter=" 1 , 1 , 100 , 2 ">30</span> */

// Приклад запису якщо якийсь із параметрів вказувати не треба

/* <span class="rating__text" data-counter="  , 1 ,  , 2 ">30</span> */

// ну або якщо підходять всі значення за змовченням вказуємо просто атрибут

/* <span class="rating__text" data-counter >30</span> */

//========================================================================================================================================================

// Приклад запису якщо треба ще використання свг анімації

// Для батьківського елементу задати атрибут data-circle-wrap
// <div class="rating__img" data-circle-wrap>

// І для того ж лічильника просто добавляємо атрибут data-circle
//																	  1)        2)    3)
/* <span class="rating__text" data-counter="1,1 , 100" data-circle='#37393F, #40DDB6, 4 '>30</span> */

// Де:

// 1) Колір stroke для свг
// 2) Колір fill для свг
// 3) Товщина stroke для свг


export class Counter {
	constructor(counterAtr = "data-counter", svgAtrName = "data-circle", parentAtrName = "data-circle-wrap") {
		this.counterAtr = counterAtr
		this.svgAtrName = svgAtrName
		this.parentAtrName = parentAtrName
		this.counters = []
	}

	// Створення екземпляру для кожного лічильника, перевірка щоб не створити однакові
	getCounterInstance(counterEl) {
		const existingCounter = this.counters.find((counter) => counter.counterEl === counterEl)

		if (existingCounter) {
			return existingCounter
		} else {
			const newCounter = new CounterInstance(counterEl, this)

			// Якщо поруч з лічильникм є текст задаємо відступ безпеки, за змовченням 0
			newCounter.setWidth()

			this.counters.push(newCounter)
			return newCounter
		}
	}
	// Функція callback для observer
	counterInit(entries) {
		entries.forEach((entry) => {
			const counterEl = entry.target
			const counter = this.getCounterInstance(counterEl)

			if (entry.isIntersecting) {
				// не вийшло використати observser.unobserve для того щоб з атрибуту можна було керувати чи буде запускатись анімація при кожній появі у viewport
				// тому зробив такий перемикач з чслом 17, тобто будь яке число окрім 17 в атрибуті data-counter, в четвертій позиції буде дозволяти анімації запускатись заново

				if (counter.repeat !== 17) {
					if (
						// Тут власне перевірка, якщо окрім звичайного лічильника там е ще свг то запускажмо обидві анімації, якщо атрибуту для свг нема то клас працює в режимі звичайного лічильника без свг
						counterEl.hasAttribute(this.svgAtrName) &&
						counterEl.closest(`[${this.parentAtrName}]`)
					) {
						console.log(counterEl);
						counter.setAnimationProperties()
					}
					counter.animateCounter()
					if (!counter.repeat) counter.repeat = 17
				}
			}
		})
	}
	// Стврення observer
	observe(element) {
		const options = {
			root: null,
			rootMargin: "0px 0px 0px 0px",
			threshold: 0.5,
		}

		const observer = new IntersectionObserver((entries) => this.counterInit(entries), options)

		observer.observe(element)
	}
}

//========================================================================================================================================================

class CounterInstance {
	constructor(counterEl, initData) {
		// Приймаємо дані з основного класу Counter та зберігаємо
		Object.assign(this, initData)
		this.counterEl = counterEl

		// ці методи тут ініціюються для збереження контексту this який привласнюється всередині методу, щоб можна було використати в основному класі Counter
		this.svgInit()
		this.animateCounter()
		this.setWidth()
		this.setAnimationProperties()
	}

	// Метод для обчислення ширини лічильника, та якщо потрібно, задання відстані безпеки з переводом у rem
	setWidth() {
		const width = this.counterEl.offsetWidth
		this.counterEl.style.minWidth = (width + this.range) / 16 + "rem"
	}

	// Метод ініціалізації лічильника
	animateCounter() {
		const counterValues = this.counterEl.getAttribute(this.counterAtr)

		// Приймаємо дані з атрибуту, перевіряємо, та привласнюємо значення за змовченням якщо дані не визначені
		const [customTime, customRange, customMax, repeat] = counterValues
			.split(",")
			.map((value) => parseInt(value.trim(), 10))

		this.time = customTime * 1000 || 1000

		this.range = customRange || 0

		// Приймаємо значення самого лічильника
		this.value = parseInt(this.counterEl.textContent) || 0

		// Якщо лічильник з свг і треба відсоткове значення, щоб свг заповнювався не повністю, а на відповідний відсоток
		// то нам необхідно макисмальне значення від яякого будемо рахувати відсоток, це значення задається в атрибуті data-counter в третій позиції
		this.maxValue = customMax || this.value

		// Змінна для роботи повторення анімації
		this.repeat = repeat

		// безпосередньо логіка лічильника
		// деталі у відео Жені https://www.youtube.com/watch?v=MSP-MP_TVf4
		let current = 0
		let start = null

		const step = (timestamp) => {
			if (!start) start = timestamp
			const progress = Math.min((timestamp - start) / this.time, 1)
			this.counterEl.textContent = Math.floor(progress * (current + this.value))

			if (progress < 1) {
				requestAnimationFrame(step)
			}
		}
		requestAnimationFrame(step)
	}

	// метод привласнення властивостей анімації, загалом один недолік
	// якщо анімація викликається по колу при спрацюванні observer, то ці стилі перезіписуються для елементу

	setAnimationProperties() {
		if (
			this.counterEl.hasAttribute(this.svgAtrName) &&
			this.counterEl.closest(`[${this.parentAtrName}]`)
		) {
			const styleElement = document.createElement("style")
			const offsetValue = this.totalLength - (this.totalLength * this.value) / this.maxValue

			this.uniqueAnimationName = `anim-${Math.floor(Math.random() * 10000000)} `

			this.circleElement.style.strokeDashoffset = this.totalLength

			styleElement.innerHTML = `
					@keyframes ${this.uniqueAnimationName} {
						100% {
							stroke-dashoffset: ${offsetValue}; 
						}
					}
				`

			this.circleElement.appendChild(styleElement)
			this.circleElement.style.animation = `${this.uniqueAnimationName} linear forwards`
			this.circleElement.style.animationDuration = `${this.time}ms`
		}
	}

	// Ну тут просто запис стилів з переводом в rem
	setStyles() {
		this.totalLength = this.circleElement.getTotalLength()
		this.svgElement.style.position = "absolute"
		this.svgElement.style.top = "0"
		this.svgElement.style.left = "0"
		this.svgElement.style.width = this.parentElWidth / 16 + "rem"
		this.svgElement.style.height = this.parentElWidth / 16 + "rem"
		this.svgElement.style.fill = this.fill
		this.svgElement.style.stroke = this.stroke
		this.svgElement.style.strokeWidth = this.strokeWidth / 16 + "rem"
		this.circleElement.style.strokeDasharray = this.totalLength
	}

	// Метод задання розмірів для свг зображення відносно батьківського елементу з переводом в rem
	setSvgSize() {
		const attributes = ["cx", "cy", "r"]
		this.parentElWidth = this.parentEl.offsetWidth
		console.log(this.strokeWidth)

		attributes.forEach((attr) => {
			if (attr === "r") {
				this.circleElement.setAttribute(
					attr,
					(this.parentElWidth - this.strokeWidth) / 2 / 16 + "rem"
				)
			} else {
				this.circleElement.setAttribute(attr, this.parentElWidth / 2 / 16 + "rem")
			}
		})
	}

	// Метод отримання параметрів з атрибуту для свг, з усіма перевірками та привласненні значень за змовченням
	getSvgParams() {
		const svgValues = this.counterEl.getAttribute(this.svgAtrName)

		const [custFill, custStroke, custStrokeWidth] = svgValues.split(",").map((value) => value.trim())

		// Отримуємо параметри з атрибуту, якщо не задані, присвоюємо значення за змовченням
		this.fill = custFill || "#000"
		this.stroke = custStroke || "#ff0000"
		this.strokeWidth = parseInt(custStrokeWidth, 10) || 3
	}

	// Метод безпосередньо створення свг зображення
	svgCreator() {
		this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg")
		this.svgElement.setAttribute("data-svg-circle", "")

		this.circleElement = document.createElementNS("http://www.w3.org/2000/svg", "circle")
		this.svgElement.appendChild(this.circleElement)

		this.circleElement.setAttribute("stroke-linecap", "round")

		this.parentEl.prepend(this.svgElement)
	}

	// Ну і власне ініціалізація створення свг
	svgInit() {
		this.parentEl = this.counterEl.closest(`[${this.parentAtrName}]`)

		if (this.parentEl && this.counterEl.hasAttribute(this.svgAtrName)) {
			this.parentEl.style.position = "relative"
			this.getSvgParams()
			this.svgCreator()
			this.setSvgSize()
			this.setStyles()
		}
	}
}

export const counter = new Counter()

// Якщо не подобаються назви атрибутів можна вказати свої при виклику

// Таким чином							лічильник		свг				батько свг
// export const counter = new Counter("data-counter", "data-circle", 'data-circle-wrap')
