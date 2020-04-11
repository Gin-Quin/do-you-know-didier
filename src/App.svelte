<div id="fader" status={fader}></div>

<div id="dolmenia" show={showDolmenia}>
	<img src="img/dolmenia.png" alt="">
</div>

{#if stage == "menu"}

	<h1>
		<img id="angel" src="bitmoji/standard.png" height="104px" alt=""/>
		<div id="title">
			<div class="animated bounceInDown">Do you know</div>
			<div id="didier" class="animated bounceInUp">Didier?</div>
		</div>
		<img id="demon" src="bitmoji/standard.png" height="104px" alt="">
	</h1>

	<div id="menu">
		<button
			id="start"
			class="game-music"
			on:click={startIntro}
		>
			Commencer
		</button>

		{#if document.body.parentElement.requestFullscreen}
			<button
				id="fullscreen"
				class="game-music"
				on:click={toggleFullScreen}
				pushed={isFullScreen}
			>
				Plein ecran
			</button>
		{/if}
	</div>

	<img id="resting" src="bitmoji/fuck-this-shit.png" width="270px" alt="">


{:else if stage == "intro"}

	<footer id="footer" furtive={!say} class="animated bounceInUp">
		<div id="bitmoji">
			<img src={`bitmoji/${face}.png`} alt="" width="140px">
		</div>

		<div id="bitmoji-talk">{@html say}</div>
	</footer>

{:else if stage == "game"}

	<div id="progress-bar">
		<div
			class="filler"
			style={`width: ${100 * (step+displayedStepDelta+1) / (pages.length - repetedQuestions)}%`}
		/>	
		Question {step + displayedStepDelta + 1} / {pages.length - repetedQuestions}
	</div>

	<header
		id="header"
		class={"animated " + headerAnimation}
	>
		{ page.ask }
	</header>

	<main
		id="main"
		class="animated bounceInRight"
		display={page.display || "text"}
	>
		{#each page.answers as answer, index}
			<button
				on:click={clickAnswer.bind(this, answer)}
				status={answer.status || ''}
			>
				{#if page.display == 'image'}
					<img src={answer.image} alt="">
				{:else}
					<span class="index-letter">{letters[index]}</span>
				{/if}

				{answer.value}
			</button>
		{/each}
	</main>

	<footer id="footer" furtive={!say} class="animated bounceInUp">
		<div id="bitmoji">
			<img src={`bitmoji/${face}.png`} alt="" width="140px">
		</div>

		<div id="bitmoji-talk" class="">{@html say}</div>
	</footer>


{:else if stage == "story"}

	<footer id="footer" show={showFace} class="animated bounceInUp">
		<div id="bitmoji">
			<img src={`bitmoji/${face}.png`} alt="" width="140px">
		</div>

		<div id="bitmoji-talk">{@html say}</div>
	</footer>

{/if}


<script>
	import { wrongs } from './wrongSentences'
	import { pages } from './pages'
	import intro from './intro'
	import ending from './ending'
	import talkPositions from './talkPositions'
	import preloadImages from './preloadImages'

	const stories = { ending }
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	const wrongFaces = ['standard']
	const butAlso = [
		"Mais ce n'est pas tout...",
		"Mais il y a aussi...",
		"Mais ne laissons pas de côté...",
	]
	const headerAnimations = ['wobble', 'tada', 'heartBeat']

	let stage = "menu"
	let fader = ""
	let isFullScreen = !!document.fullscreenElement
	let step = -1
	let displayedStepDelta = 0
	let repetedQuestions = 3
	let showDolmenia = false
	let face = 'standard'
	let say = ""
	let hasAnswered = false
	let totalCurrentAnswers = 0
	let page = null
	let actionCallbackId = 0
	let headerAnimation = "bounceInDown"
	let speakDirection = 'right'
	let trianglePosition = 0
	let showFace = true
	let animation = ''
	let scaleX = 1
	let scaleY = 1
	let rotate = 0
	let translateX = 0
	let translateY = 0
	
	preloadImages()

	function random(x) {
		if (typeof x == 'number')
			return Math.floor(Math.random() * x)
		if (Array.isArray(x))
			return x[Math.floor(Math.random() * x.length)]
	}

	const actions = new class extends Array {
		// parse commands then add them
		execute(commands) {
			commands = commands
				.trim()
				.split('\n')
				.map(e => e.trim())
				.filter(i => i)
				.map(e => {
					let index = e.indexOf(' ')
					if (index == -1)
						return [e]
					return [
						e.slice(0, index).trim(),
						e.slice(index).trim()
					]
				})
			
			this.do(...commands)
		}

		// prepare to execute the next action
		ready(timeout=0) {
			if (actionCallbackId)
				return
			actionCallbackId = setTimeout(this.run.bind(this), timeout)
		}

		// execute the next action
		run() {
			actionCallbackId = 0
			const action = this.shift()
			if (!action)
				return
			
			if (typeof action == 'function') {
				action()
				this.ready()
			}
			else {
				const [command, argument] = action
				switch (command) {
					case 'face':
						face = argument || 'standard'
						if (stage == 'story')
							trianglePosition = talkPositions[face] || 0
						this.run()
						break
					case 'say':
						say = argument || ''
						if (!say)
							this.run()
						break
					case 'fade':
						fader = argument || 'hidden'
						this.ready()
						break
					case 'hide':
						if (argument == 'face')
							showFace = false
						else if (argument == 'dolmenia')
							showDolmenia = false
						this.run()
						break
					case 'show':
						if (argument == 'face')
							showFace = true
						else if (argument == 'dolmenia')
							showDolmenia = true
						this.run()
						break
					case 'reset':
						face = 'standard'
						say = ''
						this.run()
						break
					case 'next':
						next()
						this.ready()
						break
					case 'scaleX':
						scaleX = argument || 1
						this.run()
						break
					case 'scaleY':
						scaleY = argument || 1
						this.run()
						break
					case 'rotate':
						rotate = argument || ''
						this.run()
						break
					case 'translateX':
						translateX = argument || ''
						this.run()
						break
					case 'translateY':
						translateY = argument || ''
						this.run()
						break
					case 'animate':
						animation = argument || ''
						this.run()
						break
					case 'wait':
						this.ready(+argument || 0)
						break
					case 'story':
						stage = 'story'
						actions.length = 0
						actions.execute(stories[argument])
						break
					case 'menu':
						stage = 'menu'
						actions.length = 0
						removeEventListener('click', nextActionOnClick)
						showFace = true
						animation = ''
						scaleX = 1
						scaleY = 1
						rotate = 0
						translateX = 0
						translateY = 0
						break
					case 'displayedStepDelta':
						displayedStepDelta += (+argument)
						this.run()
						break
					case 'startGame':
						startGame()
						break

					default:
						console.warn(`Unknow command : ${command}`)
						this.run()
				}
			}
		}

		// add action(s)
		do() {
			let shouldRun = (this.length == 0)
			this.push.apply(this, arguments)
			if (shouldRun)
				this.ready()
		}
	}

	function toggleFullScreen() {
		if (document.fullscreenElement) {
			document.exitFullscreen()
			isFullScreen = false
		}
		else {
			document.body.parentElement.requestFullscreen()
			isFullScreen = true
		}
	}
	


	function next() {
		totalCurrentAnswers = 0
		step++
		if (step > pages.length)
			return
		page = pages[step]
		
		if (step)
			headerAnimation = headerAnimations[step % headerAnimations.length]
		
		for (let node of document.querySelectorAll('#main > button')) {
			node.setAttribute('status', '')
		}
		if (page.intro)
			actions.execute(page.intro)
		else
			resetBitmoji()
	}
	

	function clickAnswer(answer) {
		const requestedAnswers = page.requestedAnswers || 1
		if (totalCurrentAnswers >= requestedAnswers)
			return
		
		if (answer.valid === undefined) {
			actions.execute(answer.action || `
				face ${random(wrongFaces)}
				say ${random(wrongs)}
			`)
			return
		}
		
		totalCurrentAnswers++
		this.setAttribute('status', 'checking')

		setTimeout(() => {
			this.setAttribute('status', answer.valid ? "right" : "wrong")
			actions.length = 0  // we remove the remaining actions

			if (answer.action)
				actions.execute(answer.action)
			
			if (totalCurrentAnswers >= requestedAnswers) {
				if (page.outro)
					actions.execute(page.outro)
				actions.do(next)
			}
			else if (page.sentencesNext) {
				actions.execute(`
					face
					say ${random(page.sentencesNext)}
				`)
			}

		}, 750)

	}

	function resetBitmoji() {
		if (!actionCallbackId && !actions.length)
			actions.do(['face'], ['say'])
	}


	function startIntro() {
		stage = "intro"
		actions.execute(intro)
		setTimeout(() => {
			addEventListener('click', nextActionOnClick)
		}, 0)
	}

	function nextActionOnClick() {
		resetBitmoji()
		actions.ready()
	}

	function startGame() {
		stage = "game"
		step = -1
		next()
	}
</script>


<style>
	h1 {
		font-family: GameMusic;
		display: flex;
		width: 100%;
		justify-content: space-around;
		align-items: center;
		position: absolute;
		top: 0;
		letter-spacing: 2px;
		font-size: 1.2rem;
		text-shadow: 0 1px 1px #eee;
		color: #111;
	}

	#didier {
		font-size: 2rem;
		margin-top: 2%;
		text-shadow: 0 1px 1px #eee;
	}

	#title > div {
		text-align: center;
		display: flex;
		justify-content: center;
	}

	img#resting {
		position: absolute;
		bottom: 3%;
		left: calc(50% - 150px);
	}

	#menu {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	button#start {
		font-size: 26px;
		text-shadow: 1px 1px 1px black;
		width: 100%;
		height: 82px;
		background: rgba(0, 0, 0, 0.15);
		border-radius: 0;
		border-top: 2px solid rgba(0,0,0,0.3);
		border-bottom: 2px solid rgba(0,0,0,0.3);
		box-shadow: 0 0 2px 2px rgba(0,0,0, 0.15);
	}
	button#start:hover {
		background: rgba(0, 0, 0, 0.12);
		font-size: 28px;
	}

	#header {
		min-height: 68px;
		position: relative;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-family: Galiver;
		letter-spacing: 2px;
		font-size: 21px;
		font-weight: bold;
		color: #FEFEFE;
		text-shadow: 0 2px 2px rgba(0,0,0,0.9);
		background: rgba(0,0,0,0.3);
		box-shadow: 0 0 3px 5px rgba(0,0,0,0.3);
		margin: 12px 18px;
		padding: 0 10px;
		text-align: center;
		line-height: 30px;
	}

	#main {
		display: flex;
		flex: 1;
		overflow: auto;
		margin-bottom: 12px;
		padding-bottom: 102px;
	}
	@media screen and (max-height: 600px) {
		#main {
			padding-bottom: 0;
		}
	}
	#main > button {
		cursor: pointer;
		border: none;
		border-radius: 4px;
	}
	#main > button:hover {
		box-shadow: 0 0 1px 5px rgba(0,0,0,0.18);
	}
	#main > button > .index-letter {
		position: absolute;
		left: 16px;
		color: #888;
	}

	#main[display=text] {
		flex-direction: column;
	}

	#main[display=text] > button {
		display: flex;
		flex-direction: column;
		justify-content: center;
		font-family: CrimsonText;
		font-size: 22px;
		position: relative;
		background: rgb(235,235,235);
		margin: 8px 14px;
		padding: 14px 40px;
		padding-top: 18px;
		font-weight: bold;
		font-size: 21px;
		color: #333;
		text-align: start;
	}

	#main[display=image] {
		display: block;
		text-align: center;
	}
	#main[display=image] > button {
		font-family: CrimsonText;
		font-size: 18px;
		font-weight: bold;
		display: inline-block;
		width: calc(48% - 12px);
		background: #fefefe;
		flex-shrink: 0;
		flex-wrap: wrap;
		text-align: center;
		padding: 6px;
		margin: 1%;
		vertical-align: middle;
	}
	#main[display=image] > button > img {
		filter: none;
		width: 100%;
		background: white;
	}

	#main > button[status=checking] {
		background: #f9f65e;
	}
	#main > button[status=right] {
		background: #75f475;
	}
	#main > button[status=wrong] {
		/* background: #ec3a3a; */
		background: #f21b1b;
	}

	/* @media screen and (max-width: 400px) and (min-height: 600px) {
		#main[display=image] > button {
			width: calc(100% - 24px);
		}
	} */

	#footer {
		position: absolute;
		bottom: 0;
		height: 114px;
		width: 100%;
		z-index: 10;
		flex-shrink: 0;
		overflow: visible;
		transition: bottom 0.2s ease-out;
	}

	#footer[furtive=true] {
		width: auto;
		bottom: -14px;
	}

	#footer[show=false] {
		display: none;
	}

	@media screen and (max-height: 600px) {
		#footer[furtive=true] {
			bottom: -160px;
		}
	}

	#dolmenia {
		position: absolute;
		width: 90%;
		left: 5%;
		top: 3%;
		padding: 0 3px;
		background: white;
		border-radius: 18px;
		box-shadow: 0 0px 12px 3px rgba(255,255,255,0.8);
		cursor: default;
		z-index: 5;
		opacity: 0;
		transition: opacity 1s linear;
		pointer-events: none;
	}

	#dolmenia[show=true] {
		opacity: 1;
	}

	#dolmenia > img {
		width: 100%;
		border-radius: 18px;
		position: relative;
		top: 4px;
	}


	#bitmoji > img {
		position: relative;
		top: -22px;
	}

	#bitmoji-talk {
		position: absolute;
		left: 140px;
		bottom: 22px;
		width: calc(100% - 177px);
		background: #fefefe;
		padding: 18px;
		border-radius: 18px;
		border-bottom-left-radius: 0;
		box-shadow: inset -1px -1px 1px 1px rgba(0,0,0,0.7);
		cursor: default;
		line-height: 25px;
	}

	#bitmoji-talk:empty {
		display: none;
	}

	#progress-bar {
		font-family: GameMusic;
		height: 24px;
		margin: 6px 12px 0px;
		border: 2px solid rgba(0,0,0,0.5);
		border-radius: 12px;
		position: relative;
		color: rgba(0,0,0,0.5);
		text-align: center;
		font-size: 14px;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
	}

	#progress-bar > .filler {
		z-index: -1;
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		background-color: #75f475;
		transition: width 0.8s ease-out;
		width: 0;
	}

	#angel {
		position: relative;
		top: -10px;
		animation: MoveUpDown 2.6s ease-in-out infinite alternate;
	}

	#demon {
		position: relative;
		top: -10px;
		transform: scaleX(-1);
		animation: MoveUpDown 2.2s ease-in-out infinite alternate;
	}

	@keyframes MoveUpDown {
		0% {
			top: -10px;
		}
		100% {
			top: 10px;
		}
	}


	#fader {
		z-index: -1000;
		position: fixed;
		background-color: transparent;
		width: 100vw;
		height: 100vh;
		left: 0;
		top: 0;
		transition: background-color 3s linear;
	}

	#fader[status="darker"] {
		background-color: rgba(0, 0, 0, 0.7)
	}

	@media screen and (max-height: 562px) {
		#menu {
			position: relative;
			top: -30px;
		}
	}
	
	@media screen and (max-height: 462px) {
		#menu {
			position: relative;
			top: 40px;
		}

		#resting {
			display: none;
		}
	}

</style>