// Hivemind scrobbler

const users = []

const getTopTracks = async (user) => {
	const data = await sendHttpRequest('GET', `${ROOT_URL}?method=user.gettoptracks&user=${user}&api_key=${api_key}&format=json`)	
	let json = JSON.parse(data)
	return(json['toptracks']['track'])
}


const plot = async () => {
	const data = await getTopTracks('g_biz')
	let div = document.createElement('div')
	document.body.appendChild(div)
	var svg = d3.select("div")
		
	console.log(data)
}

plot()
