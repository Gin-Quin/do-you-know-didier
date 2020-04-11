export const pages = [
	{
		ask: "Dans quelle ville habite Didier ?",
		answers: [
			{
				value: "Angevilliers",
				valid: true,
			},
			{
				value: "Sordyds-sur-Yvette",
				action: `
					say Pas loin, c'est à 40km de là.
				`
			},
			{
				value: "Laval",
				action: `
					face give-up
					say Cette ville de nullos, sérieusement ? C'est pas ça.
				`
			},
			{
				value: "Poitiers",
				action: `
					face what-you-doing
					say C'est toi qui habite Poitiers, Dugland ! Essaie encore.
				`
			},
		],

		outro: `
			say Bien joué ! Toi tu n'es pas aussi naze que les autres.
		`
	},



	{
		ask: "Quel âge a Didier ?",
		answers: [
			{
				value: "Plus de 29 ans",
				valid: true,
			},
			{
				value: "À peu près 37 ans",
				valid: true,
			},
			{
				value: "Moins de 53 ans",
				valid: true,
			},
			{
				value: "L'une de ces propositions est sans doute la bonne",
				action: `
					say On ne peut rien te cacher ! Mais ça c'est pas du jeu.
				`
			},
		],
		outro: `
			face no-hope
			say Mouais... C'est un peu approximatif, mais on va dire que ça passe.
			face perplexed
			say Je m'attendais à mieux de toi.
		`
	},


	{
		ask: "Quelle est la couleur préférée de Didier ?",
		answers: [
			{
				value: "Le blanc",
				valid: true,
			},
			{
				value: "Le gris",
				valid: true,
			},
			{
				value: "Le noir",
				valid: true,
			},
			{
				value: "Le vert-de-gris",
				valid: true,
			},
		],
		outro: `
			face smile
			say Hey, tu ne t'en sors pas si mal !
			face well-ok
			say Je suis presque épaté.
			face wry
			say Presque...
		`
	},



	{
		ask: "Quelle taille mesure Didier ?",
		answers: [
			{
				value: "Sembalek",
				action: `
					face wry
					say Mais ouais ! Osef de ces questions intimes ! Mais réponds quand même, dugland !
				`
			},
			{
				value: "Il est beau, c'est tout ce qui importe",
				action: `
					face suspicious
					say En plus d'être quelqu'un de malin tu es aussi un sacré lèche-cul : tu peux faire mieux !
				`
			},
			{
				value: "Une toise",
				action: `
					face suspicious
					say Tu sais ce que c'est au moins ?
				`
			},
			{
				value: "Six pieds",
				valid: true,
			},
			{
				value: "Deux verges et une aune et demi",
				action: `
					face no-hope
					say Tu es... pitoyable.
				`
			},
		],
		outro: `
			face not-impressed
			say T'as répondu au pif, avoue.
			face give-up
			say Bon, de toute manière on s'en fiche.
			face wry
			say Tu me fais perdre mon temps. Question suivante !
		`
	},


	{
		ask: "Classe les personnes les plus nulles de l'entourage de Didier, du plus haïssable au plus détestable :",
		requestedAnswers: 6,
		answers: [
			{
				value: "Albert",
				valid: true,
				action: `
					face smile
					say Ouais ! Lui il est vraiment naze.
				`
			},
			{
				value: "Gérald",
				valid: true,
				action: `
					face unsure
					say Sans doute le type le plus nul de la Terre.
				`
			},
			{
				value: "Rose-Marie",
				valid: true,
				action: `
					face well-ok
					say Moui...
				`
			},
			{
				value: "Maxime",
				valid: true,
				action: `
					face what-you-doing
					say Quel gros con ce Maxime !
				`
			},
			{
				value: "Mirabelle",
				valid: true,
				action: `
					face no-hope
					say En plus d'être pas très jolie elle est bien débile, ouais !
				`
			},
			{
				value: "Marie-Églantine",
				valid: true,
				action: `
					face wry
					say Qui se rappelle de Marie-Eglantine ? Elle mérite même pas d'être dans cette histoire tellement elle est nulle.
				`
			},
		],
		outro: `
			face no-hope
			say C'est bien, tu avances !
			face unsure
			show dolmenia
			say Si ça se trouve, c'est avec toi que je vais aller à <b>DOLMENIA</b> ?
			face perplexed
			say Peut-être même qu'on pourrait bien s'entendre ?
			hide dolmenia
		`
	},





	{
		ask: "Quelle est le nom de la première petite amie de Didier ?",
		answers: [
			{
				value: "Marie-Aline",
				valid: false,
			},
			{
				value: "Marilène",
				valid: false,
			},
			{
				value: "Marie-Lyne",
				valid: false,
			},
			{
				value: "Marlène",
				valid: false,
			},
		],
		outro: `
			face suspicious
			say Non ! C'est pas ça !
			face wry
			say Mais de toute manière je déteste cette question.
			face suspicious
			say On passe à la suivante et on ne parle plus jamais de Maryline !
		`
	},


	{
		ask: "Dans le chapitre « Moi et les gogols qui répondent aux quizz », que répond Didier lorsque Gérald lui demande de l'aide pour répondre à son quizz ?",
		answers: [
			{
				value: "Je déteste ça !",
				valid: true,
			},
			{
				value: "Je te déteste, Gérald !",
				valid: true,
			},
			{
				value: "Je déteste les quizz !",
				valid: true,
			},
			{
				value: "Je déteste les gens qui répondent aux quizz !",
				action: `
					face not-impressed
					say T'es trop meta toi ! Relis la question avant de répondre n'importe quoi !
				`,
			},
		],
		outro: `
			say En fait, tu me connais plutôt bien
			say Ça fait plaisir.
			say Bon, maintenant qu'on s'est débarrassé de tous les nullos qui ne me connaissent pas bien, on va pouvoir calmer le jeu.
			face smile
			say OU PAS !
			face not-impressed
			say Je vois qu'il y a encore un tas de débiles parmi vous qui n'ont pas eu la décence d'abandonner.
			face suspicious
			say Vous me faites suer !
			say Vraiment.
			face wry
			say Allez... Question suivante.
		`
	},



	{
		ask: "Qu'est-ce que Didier déteste le plus au monde ?",
		requestedAnswers: 4,
		sentencesNext: ["Mais je déteste aussi...", "Qui d'autre ?"],
		answers: [
			{
				value: "Les gendarmes",
				valid: true,
			},
			{
				value: "Les chauffeurs de bus",
				valid: true,
			},
			{
				value: "Les DRH",
				valid: true,
			},
			{
				value: "Les témoins de Jéhova",
				valid: true,
			},
		],
		outro: `
			face drink-coffee
			say Bravo.
			say Seuls 17% des candidats sont parvenus jusqu'ici.
			say Tu te sens assez bon ?
			say T'es en confiance ?
			say Tu veux une putain de médaille ?
			face what-you-doing
			say Tu es à peine arrivé à la moitié et tu es déjà en train de te la péter ?
			say C'est nul comme comportement !
			say Pour te punir...
			face drink-coffee
			say Tu vas reculer de deux cases et recommencer à la question six.
			say J'espère que ça te servira de leçon.
			displayedStepDelta -3
		`
	},



	{
		ask: "Quelle est le nom de la première petite amie de Didier ?",
		answers: [
			{
				value: "Marie-Lou",
				valid: false,
			},
			{
				value: "Marie-quelquechose",
				valid: false,
			},
			{
				value: "Marie-Esther",
				valid: false,
			},
			{
				value: "Marie-Machin",
				valid: false,
			},
		],
		outro: `
			face suspicious
			say Non ! C'est re-pas ça !
			face wry
			say Mais de toute manière je re-déteste cette question.
			face suspicious
			say On passe à la suivante et on ne re-parle plus jamais de Marie-Truc !
		`
	},



	{
		ask: "Dans le chapitre « Moi et les gogols qui rerépondent aux quizz », que répond Didier lorsque Albert lui demande de l'aide pour répondre à son quizz ?",
		answers: [
			{
				value: "Je hais ça !",
				valid: true,
			},
			{
				value: "Je te hais, Albert !",
				valid: true,
			},
			{
				value: "Je hais les quizz !",
				valid: true,
			},
			{
				value: "Je hais les gens qui répondent aux quizz",
				valid: true,
			},
		],
		outro: `
			say Tu as une impression de déjà-vu, non ?
			say C'est normal. C'est de la manipulation mentale.
			say En général, ça marche bien sur les esprits faibles comme toi.
		`
	},


	{
		ask: "Qu'est-ce que Didier déteste le plus au monde ?",
		requestedAnswers: 6,
		sentencesNext: ["Mais je déteste aussi...", "Qui d'autre ?"],
		answers: [
			{
				value: "Les journalistes",
				valid: true,
			},
			{
				value: "Les DRH",
				valid: true,
			},
			{
				value: "Les chauffeurs de taxi",
				valid: true,
			},
			{
				value: "Les gens qui travaillent aux RH",
				valid: true,
			},
			{
				value: "Les contrôleurs aériens",
				valid: true,
			},
			{
				value: "Les directrices des ressources humaines",
				valid: true,
			},
		],
		outro: `
			face drink-coffee
			say Bon, je vois que cette punition t'a fait le plus grand bien.
			say Je sens que tu es revenu à un meilleur état d'esprit.
			say Tu as le droit de continuer.
			say Ne suis-je pas d'une grande clémence ?
		`
	},


	{
		ask: "Qu'est ce que préfère le plus Didier au monde ?",
		requestedAnswers: 6,
		answers: [
			{
				value: "Le céleri rémoulade",
				valid: true,
				action: `
					face smile
					say Ouais j'adore ça ! Mais j'aime encore plus...
				`
			},
			{
				value: "Les genoux de Rose-Marie",
				valid: true,
				action: `
					face perplexed
					say Pfff...
				`
			},
			{
				value: "Les cheveux de Rose-Marie",
				valid: true,
				action: `
					face wry
					say Hein ?!
				`
			},
			{
				value: "Les chevilles de Rose-Marie",
				valid: true,
				action: `
					face what-you-doing
					say Mais heu !
				`
			},
			{
				value: "Les yeux de Rose-Marie",
				valid: true,
				action: `
					face suspicious
					say MAIS !
				`
			},
			{
				value: "L'élégance naturelle de Rose-Marie",
				valid: true,
				action: `
					face wry
					say Mais noooon...
				`
			},
		],
		outro: `
			face suspicious
			say Pfff... Alors là ! Non, mais ! Pfff !
			say C'est n'importe quoi ! Quel est l'abruti qui a rédigé cette question toute pourrie ?
			face wry
			say C'est même pas vrai en plus !
			say Ridicule !
			say En plus, elle n'est pas SI jolie que ça, cette greluche...
			face suspicious
			say <i>(Je la déteste !)</i>
		`
	},


	{
		ask: "Quel est le premier prénom de Rose-Marie ?",
		answers: [
			{
				value: "Rose",
				action: `
					face no-hope
					say T'es con ou quoi ?
				`
			},
			{
				value: "Marie",
				action: `
					face clap-right
					say Ah ouais, c'est bien ce que je pensais : t'es un vrai débile. Bravo.
				`
			},
			{
				value: "Kelly",
				valid: true,
				action: `
					face smile
					say MAIS OUAIS !
					say Comment tu as fait pour répondre à celle là !
				`
			},
			{
				value: "Osef, c'est un questionnaire sur Didier, pas sur cette morue de Rose-Marie",
				valid: true,
				action: `
					face smile
					say Ahah ! Allez, je te l'accorde !
				`
			},
		],
		outro: `
			face not-bad
			say Pas mal du tout pour un gros naze de ton genre.
			face what-you-doing
			say Plus qu'une seule question !
			face drink-coffee
			say Et c'est ici que tout va se jouer.
			say C'est la question finale.
			say Celle qui va déterminer le vainqueur de cette âpre compétition.
			say Oui... « âpre ».
			face not-impressed
			say Tu sais pas ce que ça veut dire ?
			say Ben t'as perdu : casse-toi !
			face hihi
			say JE DÉCOOONNE !
			face smile
			say Tu peux rester.
			face sorry
			say C'est pas grave si tu n'as pas plus de trente sept mots de vocabulaire.
			face well-ok
			say La plupart des gens que je connais n'en ont que deux cent quarante trois.
			face sorry
			say Tu vois, c'est pas si grave.
			face not-bad
			say Ça veut juste dire que tu es un peu débile, mais on t'en veut pas.
			say Personne ne t'en veut. Moi, je t'en veux pas.
			face standard
			say J'ai juste besoin d'un ami.
			show dolmenia
			say Pour aller à <b>DOLMENIA</b>.
			hide dolmenia
			face smile
			say Allez, steuplé !
			say La joue pas miskine comme ça !
			say Te fâche pas !
			face what-you-doing
			say Reviens.
			say Promis : je serai sympa.
			say Je te tuerai pas après la promenade à <b>DOLMENIA</b> !
			face well-ok
			say Sauf si tu me fais vraiment chier...
			face what-you-doing
			say Mais tu le feras pas, hein ?
			face smile
			say On est presque des amis maintenant.
			say Tu me connais si bien.
			say Tu as répondu à toutes ces questions super difficiles !
			face unsure
			say (Tu sais ce que ça veut dire « difficile » pas vrai ?)
			face smile
			say Tu connais presque TOUS MES SECRETS !
			face wry
			say Tu sais, je n'ai jamais eu d'amis.
			face what-you-doing
			say De <i>vrais amis</i> je veux dire.
			face wry
			say Personne comme toi.
			say En fait, personne d'autre n'est arrivé jusqu'ici.
			say Et pour valider la victoire...
			face what-you-doing
			say Il faut juste que tu répondes à cette dernière petite question.
			face sad
			say S'il-te-plaît...
			say Tu es d'accord ?
			face smile
			say SUPER !
			say C'est parti pour la question de la VICTOIRE !
			face hihi
			say Elle est super facile en plus !
		`
	},



	{
		ask: "Question ULTIME : quel est le deuxième prénom de Didier ?",
		answers: [
			{
				value: "Patrick",
				valid: false,
			},
			{
				value: "Fred",
				valid: false,
			},
			{
				value: "Il n'en a pas",
				valid: false,
			},
			{
				value: "Sylvain",
				valid: false,
			},
			{
				value: "Florian",
				valid: false,
			},
			{
				value: "Laurent",
				valid: false,
			},
			{
				value: "Davy",
				valid: false,
			},
			{
				value: "Mickey",
				valid: false,
			},
			{
				value: "Mathieu",
				valid: false,
			},
			{
				value: "Camille",
				valid: false,
			},
			{
				value: "Adrien",
				valid: false,
			},
			{
				value: "Marin",
				valid: false,
			},
			{
				value: "Jérémy",
				valid: false,
			},
			{
				value: "Gabriel",
				valid: false,
			},
			{
				value: "Yoann",
				valid: false,
			},
			{
				value: "Sandro",
				valid: false,
			},
		],
		outro: `
			face spit-coffee
			say !!!
			face smile
			say Quoi ?
			face not-good
			say Il vient de se passer quoi là ?
			face suspicious
			say Tu
			say n'as
			say pas 
			face no-hope
			say ... su répondre à la question la plus facile du quizz !
			face clap-left
			say Bravo.
			face clap-right
			say Vraiment, bravo.
			face clap-left
			say Tu déchires tout.
			face sad
			say Moi qui avait tout misé sur toi.
			face what-you-doing
			say En fait, t'es juste en train de me dire que je viens de perdre dix minutes de ma vie.
			face suspicious
			say Que j'ai fait tous ces efforts pour rien !
			face no-hope
			say T'es même pas capable de connaître mon deuxième prénom et tu dis être mon ami ?
			face suspicious
			say Mais c'est pas ça un ami !
			face no-hope
			say Un ami, je sais pas moi !
			face wry
			say C'est quelqu'un qu'on peut réveiller à trois heures du mat' pour qu'il nous aide à planquer un cadavre. 
			say C'est quelqu'un qui a toujours un pot de céleri rémoulade dans son frigo pour le cas où j'en manquerai.
			face not-impressed
			say Un ami c'est ce que je n'aurai jamais !
			face suspicious
			say PARCE QUE JE SUIS MAUDIT !
			say JE SUIS CONDAMNÉ À ÊTRE ENTOURÉ DE JEAN FOUTRE !!!
			face wry
			say Sérieusement : casse-toi.
			say Tu n'es pas digne d'être mon ami.
			face give-up
			say De toute manière, je n'ai pas besoin d'amis.
			face sad
			say Les amis, c'est juste des nids à emmerde !
			say ...
			face what-you-doing
			say ...
			face katana
			say J'ai dit casse-toi !
			stage intro
			face katana
			hide face
			fade darker
			story ending
		`
	},

]