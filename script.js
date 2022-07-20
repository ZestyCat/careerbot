const textInput_1 = document.getElementById("input_1")

const textInput_2 = document.getElementById("input_2")

const getKeywords = document.getElementById("getKeywords")

/* Remove extra space from text input */
const squishInput = (input) => {

	/* Do some stuff */
	
	return output

}

/* Make url for yake http request */
const makeYakeUrl = (input, { method= "extract_keywords", max_size= 3, n_keywords= 20, highlight= false} = {}) => {
	
	let encoded = encodeURIComponent(`${input}`)

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

/* Sends a yake request for each 1000 character text block*/
const yakeEveryBlock = async input => {
	
	keywords = []

	for (let i = 0; i < input.length; i = i + 1000) {
		
		let block = input.slice(i, i + 1000)

		let url = makeYakeUrl(block)

		let data = await sendYakeRequest(url)
		
		for (k = 0; k < data.keywords.length; k++) {

			keywords.push(data.keywords[k].ngram)
	
		}
	}

	return keywords

} 


const compareInputs = async (a, b) => {

	let kw_a = await yakeEveryBlock(a)

	let kw_b = await yakeEveryBlock(b)

	let j = index(kw_a, kw_b)

	console.log(j)

}

getKeywords.addEventListener("click", () => { compareInputs(textInput_1.value, textInput_2.value)})
