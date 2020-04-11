
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const wrongs = [
    	"Mmmm, t'es sûr de toi là ?",
    	"Whaaa, on se calme ! Réfléchis frère. T'as tout ton temps.",
    	"...",
    	"Non, pas vraiment.",
    	"Petit indice : essaie autre chose.",
    	"Yo gros, toi-même tu sais.",
    	"Fais pas le con !",
    	"Merde ! Fais pas le con !",
    	"Faut pas exagérer quand même.",
    	"Ouaiiiis... nan, quand même pas.",
    ];

    const pages = [
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
			say Si ça se trouve, c'est avec toi que je vais aller à <b>DOLMENIA</b> ?
			face perplexed
			say Peut-être même qu'on pourrait bien s'entendre ?
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
    		ask: "Que déteste le plus Didier ?",
    		requestedAnswers: 6,
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
    			},
    			{
    				value: "Les genoux de Rose-Marie",
    				valid: true,
    			},
    			{
    				value: "Les cheveux de Rose-Marie",
    				valid: true,
    			},
    			{
    				value: "Les chevilles de Rose-Marie",
    				valid: true,
    			},
    			{
    				value: "Les yeux de Rose-Marie",
    				valid: true,
    			},
    			{
    				value: "L'élégance naturelle de Rose-Marie",
    				valid: true,
    			},
    		],
    		outro: `
			face suspicious
			say Pfff... Alors là ! Non, mais ! Pfff !
			say C'est n'importe quoi ! Quel est l'abruti qui a rédigé cette question toute pourrie ?
			face wry
			say C'est même pas vrai en plus !
			say Ridicule !
			say En plus, elle n'est SI jolie que ça, cette greluche...
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
			say JE DÉCOOOONNE !
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
			say Pour aller à <b>DOLMENIA</b>.
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

    ];

    var intro = `
	face drink-coffee
	say Je m'appelle Didier.
	say Je suis un surhomme.

	face not-impressed
	say Si tu ne sais pas qui je suis : dégage !
	say Tu n'as rien à faire ici.

	face drink-coffee
	say Si tu es de la gendarmerie : je tiens à préciser que je suis un personnage fictif.
	say Et que je n'ai jamais tué personne.
	say Pour tous les autres...

	face smile
	say Vous savez pourquoi vous êtes là, hein ?
	say <b>DOLMENIA</b>, le plus grand parc à thème de la région va bientôt ouvrir ses portes.

	face drink-coffee
	say Rose-Marie, ma DRH (une vraie connasse soit dit en passant) a voulu me récompenser de mes efforts au boulot.
	say Pour me féliciter, elle m'a « offert » deux billets pour l'inauguration de <b>DOLMENIA</b> à la seule condition que j'y aille accompagné d'un <i>ami</i>.

	face suspicious
	say Je déteste les parcs d'attraction et les saloperies d'activités culturelles à la con. C'est toujours plein de... familles !

	face smile
	say Par contre, s'il y a une chose que j'adore dans la vie, c'est faire chier les membres de ma famille et mes amis.

	face suspicious
	say Les <i>vrais</i> amis.

	face not-impressed
	say Pas les randoms comme vous trouvés sur internet.

	face drink-coffee
	say Tout le monde en ville veut des billets pour aller à cette inauguration débile. J'ai donc l'occasion de faire enrager un max' de crétins !
	say Mais pour cela, j'ai besoin que l'un de vous m'accompagne.
	say Voici donc un test pour savoir si vous me connaissez bien et si vous méritez que je sois votre ami.

	say Comme je n'ai pas du tout envie de perdre mon temps avec les plus craignos d'entre vous...

	face smile
	say On va directement passer aux questions les plus difficiles.
	say  C'est juste histoire de faire le premier tri entre les nazes et les gros nazes.

	startGame
`;

    var ending = `
	wait 1000
	face smile
	wait 3000
	show face
	say Merci d'avoir joué !
	say On s'est quand même un peu amusé, non ?
	face not-bad
	say Même si tu ne peux pas être mon ami, c'est pas grave.
	say Je sais que tu es un fan fidèle et c'est déjà mieux que rien !
	face hihi
	say Hehe !
	face not-bad
	say Merci à Lepzulnag pour avoir réalisé cette adaptation de son jeu <i>do-you-know-untel</i>.
	face smile
	say Allez <a href="https://www.wattpad.com/user/Lepzulnag" target="_blank">lire ses histoires</a> : elles sont géniales et très drôles !
	face not-bad
	say Et merci à tous les fans de Didier et de Rose-Marie.
	say Vous êtes les meilleurs non-amis qu'un super vilain rêve d'avoir !
	face smile
	fade
	say À bientôt.
	menu
`;

    var talkPositions = {
    	'disappointed': -18,
    	'very-disappointed': 17,
    	'angry': 60,
    	'drama': -10,
    	'drama-2': -7,
    	'crying': -6,
    	'crying-lot': 48,
    	'tears-bath': 3,
    	'got-you': -38,
    	'bro': -36,
    	'dancing': 0,
    	'dab': -66,
    	'pole-dance-1': 60,
    	'pole-dance-2': -74,
    	'fly-on-bird': 54,
    };

    const imagesToPreload = [
    	'bitmoji/face-standard.png',
    	'bitmoji/face-smile.png',
    	'bitmoji/face-big-smile.png',
    	'bitmoji/face-still.png',
    	'bitmoji/face-wink.png',
    	'bitmoji/face-super-cool.png',
    	'bitmoji/face-eye-right.png',
    	'bitmoji/face-eye-left.png',
    	'bitmoji/face-angry.png',
    	'bitmoji/face-slightly-mad.png',
    	'bitmoji/face-happiest.png',
    	'bitmoji/face-crying.png',
    	'bitmoji/face-crying-lot.png',
    	'bitmoji/face-laugh-with-tears.png',
    	'bitmoji/face-tear.png',
    	'bitmoji/face-gosh.png',

    	'img/height-1.png',
    	'img/height-2.png',
    	'img/height-3.png',
    	'img/teeth-1.png',
    	'img/teeth-2.png',
    	'img/teeth-3.png',
    	'img/teeth-4.png',
    	'img/baby-3.png',
    	'img/crocodile.png',
    	'img/guepard.png',
    	'img/plane.png',
    	'img/boulangerie.png',
    	'img/good-food.png',
    	'img/caca.png',

    	'bitmoji/full-very-disappointed.png',
    	'bitmoji/full-disappointed.png',
    	'bitmoji/full-drama.png',
    	'bitmoji/full-drama-2.png',
    	'bitmoji/full-crying.png',
    	'bitmoji/full-crying-lot.png',
    	'bitmoji/full-tears-bath.png',
    	'bitmoji/full-got-you.png',
    	'bitmoji/full-got-you-2.png',
    	'bitmoji/full-bro.png',
    	'bitmoji/full-dancing.png',
    	'bitmoji/full-dancing-2.png',
    	'bitmoji/full-dab.png',
    	'bitmoji/full-pole-dance-1.png',
    	'bitmoji/full-pole-dance-2.png',
    	'bitmoji/full-fly-on-bird.png',
    ]; 

    function preloadImages() {
    	for (let img of imagesToPreload)
    		(new Image).src = img;
    }

    /* src/App.svelte generated by Svelte v3.20.1 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[36] = i;
    	return child_ctx;
    }

    // (95:27) 
    function create_if_block_5(ctx) {
    	let footer;
    	let div0;
    	let img;
    	let img_src_value;
    	let t;
    	let div1;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div0 = element("div");
    			img = element("img");
    			t = space();
    			div1 = element("div");
    			if (img.src !== (img_src_value = `bitmoji/${/*face*/ ctx[5]}.png`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "width", "140px");
    			attr_dev(img, "class", "svelte-1dftq4j");
    			add_location(img, file, 98, 3, 2132);
    			attr_dev(div0, "id", "bitmoji");
    			attr_dev(div0, "class", "svelte-1dftq4j");
    			add_location(div0, file, 97, 2, 2110);
    			attr_dev(div1, "id", "bitmoji-talk");
    			attr_dev(div1, "class", "svelte-1dftq4j");
    			add_location(div1, file, 101, 2, 2199);
    			attr_dev(footer, "id", "footer");
    			attr_dev(footer, "show", /*showFace*/ ctx[9]);
    			attr_dev(footer, "class", "animated bounceInUp svelte-1dftq4j");
    			add_location(footer, file, 96, 1, 2043);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div0);
    			append_dev(div0, img);
    			append_dev(footer, t);
    			append_dev(footer, div1);
    			div1.innerHTML = /*say*/ ctx[6];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*face*/ 32 && img.src !== (img_src_value = `bitmoji/${/*face*/ ctx[5]}.png`)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*say*/ 64) div1.innerHTML = /*say*/ ctx[6];
    			if (dirty[0] & /*showFace*/ 512) {
    				attr_dev(footer, "show", /*showFace*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(95:27) ",
    		ctx
    	});

    	return block;
    }

    // (48:26) 
    function create_if_block_3(ctx) {
    	let div1;
    	let div0;
    	let div0_style_value;
    	let t0;
    	let t1_value = /*step*/ ctx[3] + /*displayedStepDelta*/ ctx[4] + 1 + "";
    	let t1;
    	let t2;
    	let t3_value = pages.length - /*repetedQuestions*/ ctx[10] + "";
    	let t3;
    	let t4;
    	let header;
    	let t5_value = /*page*/ ctx[7].ask + "";
    	let t5;
    	let header_class_value;
    	let t6;
    	let main;
    	let main_display_value;
    	let t7;
    	let footer;
    	let div2;
    	let img;
    	let img_src_value;
    	let t8;
    	let div3;
    	let footer_furtive_value;
    	let each_value = /*page*/ ctx[7].answers;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text("\t\n\t\tQuestion ");
    			t1 = text(t1_value);
    			t2 = text(" / ");
    			t3 = text(t3_value);
    			t4 = space();
    			header = element("header");
    			t5 = text(t5_value);
    			t6 = space();
    			main = element("main");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			footer = element("footer");
    			div2 = element("div");
    			img = element("img");
    			t8 = space();
    			div3 = element("div");
    			attr_dev(div0, "class", "filler svelte-1dftq4j");
    			attr_dev(div0, "style", div0_style_value = `width: ${100 * (/*step*/ ctx[3] + /*displayedStepDelta*/ ctx[4] + 1) / (pages.length - /*repetedQuestions*/ ctx[10])}%`);
    			add_location(div0, file, 50, 2, 1063);
    			attr_dev(div1, "id", "progress-bar");
    			attr_dev(div1, "class", "svelte-1dftq4j");
    			add_location(div1, file, 49, 1, 1037);
    			attr_dev(header, "id", "header");
    			attr_dev(header, "class", header_class_value = "" + (null_to_empty("animated " + /*headerAnimation*/ ctx[8]) + " svelte-1dftq4j"));
    			add_location(header, file, 57, 1, 1275);
    			attr_dev(main, "id", "main");
    			attr_dev(main, "class", "animated bounceInRight svelte-1dftq4j");
    			attr_dev(main, "display", main_display_value = /*page*/ ctx[7].display || "text");
    			add_location(main, file, 64, 1, 1368);
    			if (img.src !== (img_src_value = `bitmoji/${/*face*/ ctx[5]}.png`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "width", "140px");
    			attr_dev(img, "class", "svelte-1dftq4j");
    			add_location(img, file, 87, 3, 1883);
    			attr_dev(div2, "id", "bitmoji");
    			attr_dev(div2, "class", "svelte-1dftq4j");
    			add_location(div2, file, 86, 2, 1861);
    			attr_dev(div3, "id", "bitmoji-talk");
    			attr_dev(div3, "class", " svelte-1dftq4j");
    			add_location(div3, file, 90, 2, 1950);
    			attr_dev(footer, "id", "footer");
    			attr_dev(footer, "furtive", footer_furtive_value = !/*say*/ ctx[6]);
    			attr_dev(footer, "class", "animated bounceInUp svelte-1dftq4j");
    			add_location(footer, file, 85, 1, 1795);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, header, anchor);
    			append_dev(header, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, main, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}

    			insert_dev(target, t7, anchor);
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div2);
    			append_dev(div2, img);
    			append_dev(footer, t8);
    			append_dev(footer, div3);
    			div3.innerHTML = /*say*/ ctx[6];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*step, displayedStepDelta*/ 24 && div0_style_value !== (div0_style_value = `width: ${100 * (/*step*/ ctx[3] + /*displayedStepDelta*/ ctx[4] + 1) / (pages.length - /*repetedQuestions*/ ctx[10])}%`)) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			if (dirty[0] & /*step, displayedStepDelta*/ 24 && t1_value !== (t1_value = /*step*/ ctx[3] + /*displayedStepDelta*/ ctx[4] + 1 + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*page*/ 128 && t5_value !== (t5_value = /*page*/ ctx[7].ask + "")) set_data_dev(t5, t5_value);

    			if (dirty[0] & /*headerAnimation*/ 256 && header_class_value !== (header_class_value = "" + (null_to_empty("animated " + /*headerAnimation*/ ctx[8]) + " svelte-1dftq4j"))) {
    				attr_dev(header, "class", header_class_value);
    			}

    			if (dirty[0] & /*page, clickAnswer*/ 4224) {
    				each_value = /*page*/ ctx[7].answers;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(main, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*page*/ 128 && main_display_value !== (main_display_value = /*page*/ ctx[7].display || "text")) {
    				attr_dev(main, "display", main_display_value);
    			}

    			if (dirty[0] & /*face*/ 32 && img.src !== (img_src_value = `bitmoji/${/*face*/ ctx[5]}.png`)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*say*/ 64) div3.innerHTML = /*say*/ ctx[6];
    			if (dirty[0] & /*say*/ 64 && footer_furtive_value !== (footer_furtive_value = !/*say*/ ctx[6])) {
    				attr_dev(footer, "furtive", footer_furtive_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(48:26) ",
    		ctx
    	});

    	return block;
    }

    // (38:27) 
    function create_if_block_2(ctx) {
    	let footer;
    	let div0;
    	let img;
    	let img_src_value;
    	let t;
    	let div1;
    	let footer_furtive_value;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div0 = element("div");
    			img = element("img");
    			t = space();
    			div1 = element("div");
    			if (img.src !== (img_src_value = `bitmoji/${/*face*/ ctx[5]}.png`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "width", "140px");
    			attr_dev(img, "class", "svelte-1dftq4j");
    			add_location(img, file, 41, 3, 888);
    			attr_dev(div0, "id", "bitmoji");
    			attr_dev(div0, "class", "svelte-1dftq4j");
    			add_location(div0, file, 40, 2, 866);
    			attr_dev(div1, "id", "bitmoji-talk");
    			attr_dev(div1, "class", "svelte-1dftq4j");
    			add_location(div1, file, 44, 2, 955);
    			attr_dev(footer, "id", "footer");
    			attr_dev(footer, "furtive", footer_furtive_value = !/*say*/ ctx[6]);
    			attr_dev(footer, "class", "animated bounceInUp svelte-1dftq4j");
    			add_location(footer, file, 39, 1, 800);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div0);
    			append_dev(div0, img);
    			append_dev(footer, t);
    			append_dev(footer, div1);
    			div1.innerHTML = /*say*/ ctx[6];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*face*/ 32 && img.src !== (img_src_value = `bitmoji/${/*face*/ ctx[5]}.png`)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*say*/ 64) div1.innerHTML = /*say*/ ctx[6];
    			if (dirty[0] & /*say*/ 64 && footer_furtive_value !== (footer_furtive_value = !/*say*/ ctx[6])) {
    				attr_dev(footer, "furtive", footer_furtive_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(38:27) ",
    		ctx
    	});

    	return block;
    }

    // (3:0) {#if stage == "menu"}
    function create_if_block(ctx) {
    	let h1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div2;
    	let div0;
    	let t2;
    	let div1;
    	let t4;
    	let img1;
    	let img1_src_value;
    	let t5;
    	let div3;
    	let button;
    	let t7;
    	let t8;
    	let img2;
    	let img2_src_value;
    	let dispose;
    	let if_block = document.body.parentElement.requestFullscreen && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			img0 = element("img");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Do you know";
    			t2 = space();
    			div1 = element("div");
    			div1.textContent = "Didier?";
    			t4 = space();
    			img1 = element("img");
    			t5 = space();
    			div3 = element("div");
    			button = element("button");
    			button.textContent = "Commencer";
    			t7 = space();
    			if (if_block) if_block.c();
    			t8 = space();
    			img2 = element("img");
    			attr_dev(img0, "id", "angel");
    			if (img0.src !== (img0_src_value = "bitmoji/standard.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "height", "104px");
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-1dftq4j");
    			add_location(img0, file, 5, 2, 70);
    			attr_dev(div0, "class", "animated bounceInDown svelte-1dftq4j");
    			add_location(div0, file, 7, 3, 159);
    			attr_dev(div1, "id", "didier");
    			attr_dev(div1, "class", "animated bounceInUp svelte-1dftq4j");
    			add_location(div1, file, 8, 3, 215);
    			attr_dev(div2, "id", "title");
    			attr_dev(div2, "class", "svelte-1dftq4j");
    			add_location(div2, file, 6, 2, 139);
    			attr_dev(img1, "id", "demon");
    			if (img1.src !== (img1_src_value = "bitmoji/standard.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "height", "104px");
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-1dftq4j");
    			add_location(img1, file, 10, 2, 285);
    			attr_dev(h1, "class", "svelte-1dftq4j");
    			add_location(h1, file, 4, 1, 63);
    			attr_dev(button, "id", "start");
    			attr_dev(button, "class", "game-music svelte-1dftq4j");
    			add_location(button, file, 14, 2, 378);
    			attr_dev(div3, "id", "menu");
    			attr_dev(div3, "class", "svelte-1dftq4j");
    			add_location(div3, file, 13, 1, 360);
    			attr_dev(img2, "id", "resting");
    			if (img2.src !== (img2_src_value = "bitmoji/fuck-this-shit.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "width", "270px");
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", "svelte-1dftq4j");
    			add_location(img2, file, 34, 1, 695);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, img0);
    			append_dev(h1, t0);
    			append_dev(h1, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(h1, t4);
    			append_dev(h1, img1);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, button);
    			append_dev(div3, t7);
    			if (if_block) if_block.m(div3, null);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, img2, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*startIntro*/ ctx[13], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (document.body.parentElement.requestFullscreen) if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(img2);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(3:0) {#if stage == \\\"menu\\\"}",
    		ctx
    	});

    	return block;
    }

    // (77:4) {:else}
    function create_else_block(ctx) {
    	let span;
    	let t_value = letters[/*index*/ ctx[36]] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "index-letter svelte-1dftq4j");
    			add_location(span, file, 77, 5, 1680);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(77:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (75:4) {#if page.display == 'image'}
    function create_if_block_4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*answer*/ ctx[34].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1dftq4j");
    			add_location(img, file, 75, 5, 1631);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*page*/ 128 && img.src !== (img_src_value = /*answer*/ ctx[34].image)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(75:4) {#if page.display == 'image'}",
    		ctx
    	});

    	return block;
    }

    // (70:2) {#each page.answers as answer, index}
    function create_each_block(ctx) {
    	let button;
    	let t0;
    	let t1_value = /*answer*/ ctx[34].value + "";
    	let t1;
    	let t2;
    	let button_status_value;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*page*/ ctx[7].display == "image") return create_if_block_4;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if_block.c();
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(button, "status", button_status_value = /*answer*/ ctx[34].status || "");
    			attr_dev(button, "class", "svelte-1dftq4j");
    			add_location(button, file, 70, 3, 1500);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			if_block.m(button, null);
    			append_dev(button, t0);
    			append_dev(button, t1);
    			append_dev(button, t2);
    			if (remount) dispose();

    			dispose = listen_dev(
    				button,
    				"click",
    				function () {
    					if (is_function(/*clickAnswer*/ ctx[12].bind(this, /*answer*/ ctx[34]))) /*clickAnswer*/ ctx[12].bind(this, /*answer*/ ctx[34]).apply(this, arguments);
    				},
    				false,
    				false,
    				false
    			);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button, t0);
    				}
    			}

    			if (dirty[0] & /*page*/ 128 && t1_value !== (t1_value = /*answer*/ ctx[34].value + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*page*/ 128 && button_status_value !== (button_status_value = /*answer*/ ctx[34].status || "")) {
    				attr_dev(button, "status", button_status_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if_block.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(70:2) {#each page.answers as answer, index}",
    		ctx
    	});

    	return block;
    }

    // (23:2) {#if document.body.parentElement.requestFullscreen}
    function create_if_block_1(ctx) {
    	let button;
    	let t;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Plein ecran");
    			attr_dev(button, "id", "fullscreen");
    			attr_dev(button, "class", "game-music");
    			attr_dev(button, "pushed", /*isFullScreen*/ ctx[2]);
    			add_location(button, file, 23, 3, 534);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*toggleFullScreen*/ ctx[11], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*isFullScreen*/ 4) {
    				attr_dev(button, "pushed", /*isFullScreen*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(23:2) {#if document.body.parentElement.requestFullscreen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let t;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*stage*/ ctx[0] == "menu") return create_if_block;
    		if (/*stage*/ ctx[0] == "intro") return create_if_block_2;
    		if (/*stage*/ ctx[0] == "game") return create_if_block_3;
    		if (/*stage*/ ctx[0] == "story") return create_if_block_5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "id", "fader");
    			attr_dev(div, "status", /*fader*/ ctx[1]);
    			attr_dev(div, "class", "svelte-1dftq4j");
    			add_location(div, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*fader*/ 2) {
    				attr_dev(div, "status", /*fader*/ ctx[1]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);

    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function random(x) {
    	if (typeof x == "number") return Math.floor(Math.random() * x);
    	if (Array.isArray(x)) return x[Math.floor(Math.random() * x.length)];
    }

    function instance($$self, $$props, $$invalidate) {
    	const stories = { ending };
    	const wrongFaces = ["standard"];

    	const butAlso = [
    		"Mais ce n'est pas tout...",
    		"Mais il y a aussi...",
    		"Mais ne laissons pas de côté..."
    	];

    	const headerAnimations = ["wobble", "tada", "heartBeat"];
    	let stage = "menu";
    	let fader = "";
    	let isFullScreen = !!document.fullscreenElement;
    	let step = -1;
    	let displayedStepDelta = 0;
    	let repetedQuestions = 3;
    	let face = "standard";
    	let say = "";
    	let hasAnswered = false;
    	let totalCurrentAnswers = 0;
    	let page = null;
    	let actionCallbackId = 0;
    	let headerAnimation = "bounceInDown";
    	let speakDirection = "right";
    	let trianglePosition = 0;
    	let showFace = true;
    	let animation = "";
    	let scaleX = 1;
    	let scaleY = 1;
    	let rotate = 0;
    	let translateX = 0;
    	let translateY = 0;
    	preloadImages();

    	const actions = new (class extends Array {
    		// parse commands then add them
    		execute(commands) {
    			commands = commands.trim().split("\n").map(e => e.trim()).filter(i => i).map(e => {
    				let index = e.indexOf(" ");
    				if (index == -1) return [e];
    				return [e.slice(0, index).trim(), e.slice(index).trim()];
    			});

    			this.do(...commands);
    		}

    		// prepare to execute the next action
    		ready(timeout = 0) {
    			if (actionCallbackId) return;
    			actionCallbackId = setTimeout(this.run.bind(this), timeout);
    		}

    		// execute the next action
    		run() {
    			actionCallbackId = 0;
    			const action = this.shift();
    			if (!action) return;

    			if (typeof action == "function") {
    				action();
    				this.ready();
    			} else {
    				const [command, argument] = action;

    				switch (command) {
    					case "face":
    						$$invalidate(5, face = argument || "standard");
    						if (stage == "story") trianglePosition = talkPositions[face] || 0;
    						this.run();
    						break;
    					case "say":
    						$$invalidate(6, say = argument || "");
    						if (!say) this.run();
    						break;
    					case "fade":
    						$$invalidate(1, fader = argument || "hidden");
    						this.ready();
    						break;
    					case "hide":
    						if (argument == "face") $$invalidate(9, showFace = false);
    						this.run();
    						break;
    					case "show":
    						if (argument == "face") $$invalidate(9, showFace = true);
    						this.run();
    						break;
    					case "reset":
    						$$invalidate(5, face = "standard");
    						$$invalidate(6, say = "");
    						this.run();
    						break;
    					case "next":
    						next();
    						this.ready();
    						break;
    					case "scaleX":
    						scaleX = argument || 1;
    						this.run();
    						break;
    					case "scaleY":
    						scaleY = argument || 1;
    						this.run();
    						break;
    					case "rotate":
    						rotate = argument || "";
    						this.run();
    						break;
    					case "translateX":
    						translateX = argument || "";
    						this.run();
    						break;
    					case "translateY":
    						translateY = argument || "";
    						this.run();
    						break;
    					case "animate":
    						animation = argument || "";
    						this.run();
    						break;
    					case "wait":
    						this.ready(+argument || 0);
    						break;
    					case "story":
    						$$invalidate(0, stage = "story");
    						actions.length = 0;
    						actions.execute(stories[argument]);
    						break;
    					case "menu":
    						$$invalidate(0, stage = "menu");
    						actions.length = 0;
    						removeEventListener("click", nextActionOnClick);
    						$$invalidate(9, showFace = true);
    						animation = "";
    						scaleX = 1;
    						scaleY = 1;
    						rotate = 0;
    						translateX = 0;
    						translateY = 0;
    						break;
    					case "displayedStepDelta":
    						$$invalidate(4, displayedStepDelta += +argument);
    						this.run();
    						break;
    					case "startGame":
    						startGame();
    						break;
    					default:
    						console.warn(`Unknow command : ${command}`);
    						this.run();
    				}
    			}
    		}

    		// add action(s)
    		do() {
    			let shouldRun = this.length == 0;
    			this.push.apply(this, arguments);
    			if (shouldRun) this.ready();
    		}
    	})();

    	function toggleFullScreen() {
    		if (document.fullscreenElement) {
    			document.exitFullscreen();
    			$$invalidate(2, isFullScreen = false);
    		} else {
    			document.body.parentElement.requestFullscreen();
    			$$invalidate(2, isFullScreen = true);
    		}
    	}

    	function next() {
    		totalCurrentAnswers = 0;
    		$$invalidate(3, step++, step);
    		if (step > pages.length) return;
    		$$invalidate(7, page = pages[step]);
    		if (step) $$invalidate(8, headerAnimation = headerAnimations[step % headerAnimations.length]);

    		for (let node of document.querySelectorAll("#main > button")) {
    			node.setAttribute("status", "");
    		}

    		if (page.intro) actions.execute(page.intro); else resetBitmoji();
    	}

    	function clickAnswer(answer) {
    		const requestedAnswers = page.requestedAnswers || 1;
    		if (totalCurrentAnswers >= requestedAnswers) return;

    		if (answer.valid === undefined) {
    			actions.execute(answer.action || `
				face ${random(wrongFaces)}
				say ${random(wrongs)}
			`);

    			return;
    		}

    		totalCurrentAnswers++;
    		this.setAttribute("status", "checking");

    		setTimeout(
    			() => {
    				this.setAttribute("status", answer.valid ? "right" : "wrong");
    				actions.length = 0; // we remove the remaining actions
    				if (answer.action) actions.execute(answer.action);

    				if (totalCurrentAnswers >= requestedAnswers) {
    					if (page.outro) actions.execute(page.outro);
    					actions.do(next);
    				} else {
    					actions.execute(`
					face
					say ${random(butAlso)}
				`);
    				}
    			},
    			750
    		);
    	}

    	function resetBitmoji() {
    		if (!actionCallbackId && !actions.length) actions.do(["face"], ["say"]);
    	}

    	function startIntro() {
    		$$invalidate(0, stage = "intro");
    		actions.execute(intro);

    		setTimeout(
    			() => {
    				addEventListener("click", nextActionOnClick);
    			},
    			0
    		);
    	}

    	function nextActionOnClick() {
    		resetBitmoji();
    		actions.ready();
    	}

    	function startGame() {
    		$$invalidate(0, stage = "game");
    		$$invalidate(3, step = -1);
    		next();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		wrongs,
    		pages,
    		intro,
    		ending,
    		talkPositions,
    		preloadImages,
    		stories,
    		letters,
    		wrongFaces,
    		butAlso,
    		headerAnimations,
    		stage,
    		fader,
    		isFullScreen,
    		step,
    		displayedStepDelta,
    		repetedQuestions,
    		face,
    		say,
    		hasAnswered,
    		totalCurrentAnswers,
    		page,
    		actionCallbackId,
    		headerAnimation,
    		speakDirection,
    		trianglePosition,
    		showFace,
    		animation,
    		scaleX,
    		scaleY,
    		rotate,
    		translateX,
    		translateY,
    		random,
    		actions,
    		toggleFullScreen,
    		next,
    		clickAnswer,
    		resetBitmoji,
    		startIntro,
    		nextActionOnClick,
    		startGame
    	});

    	$$self.$inject_state = $$props => {
    		if ("stage" in $$props) $$invalidate(0, stage = $$props.stage);
    		if ("fader" in $$props) $$invalidate(1, fader = $$props.fader);
    		if ("isFullScreen" in $$props) $$invalidate(2, isFullScreen = $$props.isFullScreen);
    		if ("step" in $$props) $$invalidate(3, step = $$props.step);
    		if ("displayedStepDelta" in $$props) $$invalidate(4, displayedStepDelta = $$props.displayedStepDelta);
    		if ("repetedQuestions" in $$props) $$invalidate(10, repetedQuestions = $$props.repetedQuestions);
    		if ("face" in $$props) $$invalidate(5, face = $$props.face);
    		if ("say" in $$props) $$invalidate(6, say = $$props.say);
    		if ("hasAnswered" in $$props) hasAnswered = $$props.hasAnswered;
    		if ("totalCurrentAnswers" in $$props) totalCurrentAnswers = $$props.totalCurrentAnswers;
    		if ("page" in $$props) $$invalidate(7, page = $$props.page);
    		if ("actionCallbackId" in $$props) actionCallbackId = $$props.actionCallbackId;
    		if ("headerAnimation" in $$props) $$invalidate(8, headerAnimation = $$props.headerAnimation);
    		if ("speakDirection" in $$props) speakDirection = $$props.speakDirection;
    		if ("trianglePosition" in $$props) trianglePosition = $$props.trianglePosition;
    		if ("showFace" in $$props) $$invalidate(9, showFace = $$props.showFace);
    		if ("animation" in $$props) animation = $$props.animation;
    		if ("scaleX" in $$props) scaleX = $$props.scaleX;
    		if ("scaleY" in $$props) scaleY = $$props.scaleY;
    		if ("rotate" in $$props) rotate = $$props.rotate;
    		if ("translateX" in $$props) translateX = $$props.translateX;
    		if ("translateY" in $$props) translateY = $$props.translateY;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		stage,
    		fader,
    		isFullScreen,
    		step,
    		displayedStepDelta,
    		face,
    		say,
    		page,
    		headerAnimation,
    		showFace,
    		repetedQuestions,
    		toggleFullScreen,
    		clickAnswer,
    		startIntro
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
