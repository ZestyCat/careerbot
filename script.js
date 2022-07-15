const urlInput = document.getElementById("urlInput")
const getKeywords = document.getElementById("getKeywords")

const makeYakeUrl = (url, { method= "extract_keywords_by_url", max_size= 1, n_keywords= 20, highlight= false} = {}) => {
	
	let encoded = encodeURIComponent(url)

	let API = "https://boiling-castle-88317.herokuapp.com/yake/v2/"

	let requestUrl = `${API}${method}?url=${encoded}&max_ngram_size=${max_size}&number_of_keywords=${n_keywords}&highlight=${highlight}`

	return(requestUrl)

}

const sendYakeRequest = async (url) => {
	
	fetch(url, {
	
		method: "GET",
hello
	})
	
	.then(response => response.json())

	.then(data => {

		console.log(data)

	})

}

getKeywords.addEventListener("click", () => sendYakeRequest(makeYakeUrl("https://github.com/neoclide/coc-tsserver")))
