const textInput_1 = document.getElementById("input_1")
const textInput_2 = document.getElementById("input_2")
const fileInput = document.getElementById("fileInput")
const getKeywords = document.getElementById("getKeywords")

/* Remove extra space from text input */
const squishString = input => {
	return input.replace(/\s+/g, " ").trim()
}

/* Make url for yake http request */
const makeYakeUrl = (input, { method = "extract_keywords", max_size = 1, n_keywords = 20, highlight = true} = {}) => {
	let encoded = encodeURIComponent(`${squishString(input)}`)
	let API = "https://boiling-castle-88317.herokuapp.com/yake/v2/"
	let requestUrl = `${API}${method}?content=${encoded}&max_ngram_size=${max_size}&number_of_keywords=${n_keywords}&highlight=${highlight}`
	return(requestUrl)
}

/* Send yake request and return the promise */
const sendYakeRequest = async (url) => {
	return fetch(url, {
		method: "GET"
	})
	.then(response => response.json())
	.catch(err => console.log(err))
}

/* block multiple smaller requests into array (for web API) */
const yakeEveryBlock = async input => {
	keywords = []
	for (let i = 0; i < input.length; i = i + 3000) {
		let block = input.slice(i, i + 3000)
		let url = makeYakeUrl(block)
		let data = await sendYakeRequest(url)
		keywords.push(data)
	}
	return keywords
} 

/* Get all keywords from an array of yake objects */
const selectKeys = array => {
	keywords = []
	array.forEach(obj => {
		obj.keywords.forEach(kw => {
			keywords.push(kw.ngram) 
		})
	})
	return keywords
}

/* Compare keywords using jaccard.js functions */
const compareInputs = async (a, b) => {
	let kw_a = selectKeys(await yakeEveryBlock(a))
	let kw_b = selectKeys(await yakeEveryBlock(b))
	let comp = {
		kw_a : kw_a,
		kw_b : kw_b,
		intersection : intersection(kw_a, kw_b),
		union : union (kw_a, kw_b),
		index : index(kw_a, kw_b),
		distance : distance(kw_a, kw_b)
	}
	return comp /* Jaccard index from jaccard.js */
}

getKeywords.addEventListener("click", () => { console.log(compareInputs(textInput_1.value, textInput_2.value))})
