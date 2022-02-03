const authBtn = document.getElementById("authenticate")
const scrobbleBtn = document.getElementById("scrobble")
const api_key = "140d0850e48e4f6af1fddebb3adf1ada"  
const ROOT_URL = "http://ws.audioscrobbler.com/2.0/"
const secret = "462024f3bdd85269adc546900921240f"

// Generic HTTP request 
const sendHttpRequest = (method, url, data) => {
	const promise = new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest()
		
		xhr.open(method, url)

		if (data) {
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
		}

		xhr.onload = () => {
			resolve(xhr.response)
		}

		xhr.onerror= () => {
			reject("Something went wrong")
		}

		xhr.send(data)
	})
	return promise
}

// get XML node value
const parseXML = (xml, node) => {
	let parser = new DOMParser()
	let parsed =  parser.parseFromString(xml, "text/xml")
	let value = parsed.getElementsByTagName(node)[0].childNodes[0].nodeValue
	return(value)
}

// Links user to authentication page, then sends them to callback page
const authenticate = () => {
	window.open(`http://www.last.fm/api/auth/?api_key=${api_key}&cb=http://127.0.0.1:8080/`)	
} 

// Pulls token from callback page URL
const getToken = () => {  
	const promise = new Promise((resolve, reject) => {
		let URL = window.location.href
		
		tokenPosition = URL.search("token=")
		
		let token = URL.slice(tokenPosition + 6, tokenPosition + 38)
		
		resolve(token)
		reject("Could not get token")
	})
	return promise
}

// Signs a call
const signCall = (params) => {
	return ( 
		md5(Object.keys(params)
		.filter(key => key !== 'format' && key !== 'callback')
		.sort()
		.map(key => key + params[key])
		.join('')
		.concat(secret))
	)
}


// Creates session key and makes a cookie
const getSessionKey = async () => {
	try {
		const params = {
			token: await getToken(),
			method: 'auth.getSessionToken',
			api_key: api_key
		}

		let signature = signCall(params)
		let sessionKeyXML = await sendHttpRequest('GET', `${ROOT_URL}?method=auth.getSession&token=${params['token']}&api_key=${api_key}&api_sig=${signature}`)	
		
		sessionKey = parseXML(sessionKeyXML, 'key')

		return(sessionKey)
		
	} catch (err) {
		console.log("Could not get session key. " + err)
		return(false)
	}
}

// Makes a new cookie for the session key, overwrites the old one
const makeSessionKeyCookie = async () => {
	try {
		const sessionKey = await getSessionKey()
		
		if (sessionKey) {
			let newCookie = `fmSessionKey=${sessionKey}; max-age=86400;`
			document.cookie = newCookie
		}

	} catch (err) {
		console.log('Could not write cookie. ' + err)
	}
}

// Pulls key from cookie
const useKey = () => {	
	const key = document.cookie
		.split('; ')
		.find(item => item.startsWith('fmSessionKey'))
		.split('=')[1]
	
	return(key)
}

// Scrobbles a song
const scrobble = async (artist, track) => {
	try{
		const sk = await useKey()

		const params = {
			method: 'track.love',
			api_key: api_key,
			sk: sk,
			format: 'json',
			artist: artist,
			track: track
		}

		params['api_sig'] = signCall(params)
	
		console.log(params)
		urlParams = new URLSearchParams(params)
		const request = await sendHttpRequest('POST', ROOT_URL, urlParams)
		console.log(JSON.parse(request))

	} catch (err) {
		
		console.log("Could not scrobble. " + err)
	
	}
}
authBtn.addEventListener("click", authenticate)
scrobbleBtn.addEventListener("click", () => {scrobble('Rick Astley', 'Never Gonna Give You Up')})
