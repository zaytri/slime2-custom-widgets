'use strict';

// Globals
// ***************************************************************************
const slime2 = window.slime2;

const EPOCH_DATE = new Date(0);

const Widget = {
	readAccount: { id: '' },
	/** @type {Map<string, any>} */
	values: new Map(),
	/** @type {Set<string>} */
	messagesDeleted: new Set(),
	/** @type {Map<string, Date>} */
	usersCleared: new Map(),
	lastChatClear: EPOCH_DATE,
	lastPlayedSound: EPOCH_DATE,
	/** @type {Map<string, string>} */
	userColors: new Map(),
};

const Twitch = {
	badges: new Map(),
	cheermotes: new Map(),
	thirdPartyEmotes: new Map(),
};

const DEFAULT_COLORS = [
	'#FF4A80',
	'#FF7070',
	'#FA8E4B',
	'#FEE440',
	'#5FFF77',
	'#00F5D4',
	'#00BBF9',
	'#4371FB',
	'#9B5DE5',
	'#F670DD',
];

// Listeners
// ***************************************************************************

addEventListener('slime2:widget-values', widgetValuesListener);
addEventListener('slime2:widget-accounts', widgetAccountsListener);
addEventListener('slime2:twitch-event', twitchEventListener);

function widgetValuesListener(event) {
	Widget.values = new Map(Object.entries(event.detail));

	const widgetElement = document.getElementById('widget');

	// use in CSS as var(--custom-[cssVarName])
	function setCustomCSS(cssVarName, value) {
		widgetElement.style.setProperty(`--custom-${cssVarName}`, value);
	}

	function addClass(...classes) {
		widgetElement.classList.add(...classes);
	}

	function removeClass(...classes) {
		widgetElement.classList.remove(...classes);
	}

	function toggleClass(className, force) {
		widgetElement.classList.toggle(className, force);
	}

	// text settings
	[
		// quotation marks around font name is necessary
		// to handle font names that contain spaces
		['font-name', `"${Widget.values.get('font-name') ?? 'Inter'}"`],
		['font-size', `${Widget.values.get('font-size') ?? 14}px`],
		['font-weight', Widget.values.get('font-weight') ?? 'normal'],
		['max-width', `${Widget.values.get('max-width') ?? 500}px`],
		['line-clamp', Widget.values.get('max-lines') ?? 4],
		[
			'username-font-name',
			`"${Widget.values.get('custom-username-font-name') ?? 'Inter'}"`,
		],
		[
			'username-font-weight',
			Widget.values.get('custom-username-font-weight') ?? 'bold',
		],
		[
			'username-font-size',
			`${Widget.values.get('custom-username-font-size') ?? 14}px`,
		],
	].forEach(([cssVarName, value]) => {
		setCustomCSS(cssVarName, value);
	});

	[
		['full-width', Widget.values.get('full-width') ?? false],
		['customize-user-font', Widget.values.get('customize-user-font') ?? false],
	].forEach(([className, value]) => {
		toggleClass(className, value);
	});

	// color settings
	[
		['message-color', Widget.values.get('message-color') ?? 'black'],
		['message-bg-color', Widget.values.get('message-bg-color') ?? 'white'],
		['user-color', Widget.values.get('user-color') ?? 'white'],
		['user-bg-color', Widget.values.get('user-bg-color') ?? 'black'],
	].forEach(([cssVarName, value]) => {
		setCustomCSS(cssVarName, value);
	});

	toggleClass(
		'customize-user-colors',
		Widget.values.get('use-custom-user') ?? false,
	);

	const rainbowTypes = Widget.values.get('rainbow-types') ?? [];

	['highlighted', 'announcement', 'cheer', 'power-up'].forEach(type => {
		toggleClass(`rainbow-${type}`, rainbowTypes.includes(type));
	});

	// position settings

	const arrangeSetting = Widget.values.get('arrangement') ?? 'vertical';
	['vertical', 'horizontal', 'random', 'random-edge'].forEach(arrange => {
		toggleClass(arrange, arrangeSetting === arrange);
	});

	const verticalFlowSetting = Widget.values.get('vertical-flow') ?? 'to-top';
	['to-top', 'to-bottom'].forEach(verticalFlow => {
		toggleClass(verticalFlow, verticalFlowSetting === verticalFlow);
	});

	const verticalAlignSetting = Widget.values.get('vertical-align') ?? 'left';
	['left', 'right'].forEach(verticalAlign => {
		toggleClass(verticalAlign, verticalAlignSetting === verticalAlign);
	});

	const horizontalFlowSetting =
		Widget.values.get('horizontal-flow') ?? 'to-left';
	['to-left', 'to-right'].forEach(horizontalFlow => {
		toggleClass(horizontalFlow, horizontalFlowSetting === horizontalFlow);
	});

	const horizontalAlignSetting = Widget.values.get('horizontal-align') ?? 'top';
	['top', 'bottom'].forEach(horizontalAlign => {
		toggleClass(horizontalAlign, horizontalAlignSetting === horizontalAlign);
	});

	const randomEdges = Widget.values.get('edges') ?? ['bottom'];
	['left', 'right', 'top', 'bottom'].forEach(edge => {
		toggleClass(`${edge}-edge`, randomEdges.includes(edge));
	});
	setCustomCSS('edge-offset', `${Widget.values.get('edge-offset') ?? 100}px`);

	// corner settings

	const cornerType = Widget.values.get('corner-type') ?? 'rounded';
	['rounded', 'square', 'diagonal'].forEach(type => {
		toggleClass(type, cornerType === type);
	});

	// badge settings

	[
		['badge-display', Widget.values.get('hide-badges') ? 'none' : 'inline'],
		['badge-size', Widget.values.get('badge-size') ?? 1.25],
	].forEach(([cssVarName, value]) => {
		setCustomCSS(cssVarName, value);
	});

	// pronoun settings

	setCustomCSS(
		'pronoun-display',
		Widget.values.get('pronouns-display') === 'hidden' ? 'none' : 'inline',
	);
	setCustomCSS(
		'pronoun-transform',
		Widget.values.get('pronouns-display') ?? 'lowercase',
	);

	// plurality settings

	[
		['use-plurality', Widget.values.get('plurality-support') ?? true],
		[
			'plurality-show-usernames',
			Widget.values.get('plurality-show-usernames') ?? false,
		],
	].forEach(([className, value]) => {
		toggleClass(className, value);
	});

	// localized settings

	toggleClass(
		'localized-show-usernames',
		Widget.values.get('localized-show-usernames') ?? false,
	);

	// emote settings
	[
		['use-static-emotes', Widget.values.get('use-static-emotes') ?? false],
		[
			'use-dynamic-emote-sizing',
			Widget.values.get('use-dynamic-emote-sizing') ?? true,
		],
	].forEach(([className, value]) => {
		toggleClass(className, value);
	});

	[
		['multi-emote-size', Widget.values.get('multi-emote-size') ?? 2],
		['single-emote-size', Widget.values.get('single-emote-size') ?? 4],
	].forEach(([cssVarName, value]) => {
		setCustomCSS(cssVarName, value);
	});

	// animation settings

	toggleClass('smooth-entrance', Widget.values.get('smooth-entrance') ?? true);

	const oldAnimationClasses = [];
	widgetElement.classList.forEach(widgetClass => {
		if (widgetClass.startsWith('animation-')) {
			oldAnimationClasses.push(widgetClass);
		}
	});

	removeClass(...oldAnimationClasses);
	addClass(
		`animation-enter-${Widget.values.get('entrance-animation') ?? 'none'}`,
		`animation-exit-${Widget.values.get('exit-animation') ?? 'none'}`,
	);
}

async function widgetAccountsListener(event) {
	const accounts = event.detail?.accounts ?? [];
	const newReadAccount = accounts[0];

	// same account as stored account or undefined, skip processing
	if (!newReadAccount?.id || Widget.readAccount.id === newReadAccount.id) {
		return;
	}

	Widget.readAccount = newReadAccount;

	const [cheermotes, globalBadges, channelBadges, bttvUser, ffzRoom] =
		await Promise.all([
			getTwitchCheermotes(),
			getTwitchGlobalBadges(),
			getTwitchChannelChatBadges(),
			getBttvUser(),
			getFfzRoom(),
		]);

	// collect bttv emotes into Twitch.thirdPartyEmotes
	bttvUser?.emotes?.forEach(emote => {
		Twitch.thirdPartyEmotes.set(emote.code, { type: 'bttv', data: emote });
	});

	// collect ffz emotes into Twitch.thirdPartyEmotes
	ffzRoom?.emotes?.forEach(emote => {
		Twitch.thirdPartyEmotes.set(emote.name, { type: 'ffz', data: emote });
	});

	// collect global badges into Twitch.badges
	globalBadges?.forEach(badge => {
		const badgeVersions = new Map();

		badge.versions.forEach(version => {
			badgeVersions.set(version.id, version);
		});

		Twitch.badges.set(badge.set_id, {
			...badge,
			versions: badgeVersions,
		});
	});

	// collect channel badges into Twitch.badges
	channelBadges?.forEach(badge => {
		const badgeVersions = new Map();

		badge.versions.forEach(version => {
			badgeVersions.set(version.id, version);
		});

		Twitch.badges.set(badge.set_id, {
			...badge,
			versions: badgeVersions,
		});
	});

	// collect cheermotes into Twitch.cheermotes
	cheermotes?.forEach(cheermote => {
		const cheermoteTiers = new Map();

		cheermote.tiers.forEach(tier => {
			cheermoteTiers.set(tier.min_bits, tier);
		});

		// fallback for cheermotes that don't have a 100,000 tier
		// applies the 10,000 tier but with the 100,000 color
		if (!cheermoteTiers.has(100 * 1000)) {
			cheermoteTiers.set(100 * 1000, {
				...cheermoteTiers.get(10 * 1000),
				color: '#f3a71a',
			});
		}

		// lowercase is important because the prefix that is sent
		// in a cheermote message fragment is lowercase
		Twitch.cheermotes.set(cheermote.prefix.toLowerCase(), {
			...cheermote,
			tiers: cheermoteTiers,
		});
	});
}

function twitchEventListener(event) {
	const eventDate = new Date(event.detail.timestamp);

	const { type, data } = event.detail;

	switch (type) {
		case 'channel.chat.message':
			return handleChatMessage(data, eventDate);
		case 'channel.chat.message_delete':
			return handleChatMessageDelete(data);
		case 'channel.chat.clear':
			return handleChatClear(eventDate);
		case 'channel.chat.clear_user_messages':
			return handleChatClearUserMessages(data, eventDate);
		case 'channel.chat.notification':
			if (data.message && data.message.text) {
				// treat notifications with user input as regular chat messages
				return handleChatMessage(data, eventDate);
			}
			break;
	}
}

// Twitch Event Handlers
// ***************************************************************************

/**
 * @param {Object} data
 * @param {Date} eventDate
 */
async function handleChatMessage(data, eventDate) {
	const {
		message,
		chatter_user_name,
		chatter_user_login,
		chatter_user_id,
		message_id,
		color,
		badges,
		message_type,
		cheer,
		notice_type,
	} = data;

	const userFilterType = Widget.values.get('user-filter-type') ?? 'deny';

	// filter out users that don't match Allow Users
	if (
		userFilterType === 'allow' &&
		!(Widget.values.get('allow-users') ?? []).some(allowName => {
			return (
				chatter_user_name.toLowerCase() === allowName.toLowerCase() ||
				chatter_user_login.toLowerCase() === allowName.toLowerCase()
			);
		})
	) {
		return;
	}

	// filter out messages that start with these prefixes
	for (const hidePrefix of Widget.values.get('hide-prefixes') ?? []) {
		if (message.text.startsWith(hidePrefix)) {
			return;
		}
	}

	// filter out messages that contain these words
	for (const hideWord of Widget.values.get('hide-words') ?? []) {
		if (message.text.toLowerCase().includes(hideWord.toLowerCase())) {
			return;
		}
	}

	// filter out first time chat messages
	if (Widget.values.get('hide-first-chat') && message_type === 'user_intro') {
		return;
	}

	if (userFilterType === 'deny') {
		// filter out users that match Hide Users
		if (
			(Widget.values.get('hide-users') ?? []).some(hideName => {
				return (
					chatter_user_name.toLowerCase() === hideName.toLowerCase() ||
					chatter_user_login.toLowerCase() === hideName.toLowerCase()
				);
			})
		) {
			return;
		}

		// filter out users who fail the follow age check
		if (!(await checkFollowAge(chatter_user_id, eventDate))) {
			return;
		}
	}

	// get the index of the first non-mention fragment for proxied message
	let proxiedFragmentIndex = 0;
	if (message.fragments[0]?.type === 'mention') {
		proxiedFragmentIndex = 1;
	}

	// if that fragment isn't a text fragment, can't be a proxied message
	if (message.fragments[proxiedFragmentIndex]?.type !== 'text') {
		proxiedFragmentIndex = null;
	}

	// get user's pronouns and system information
	const [pronouns, proxiedMessage] = await Promise.all([
		getPronouns('twitch', chatter_user_id, chatter_user_login),
		getSystemProxiedMessage(
			'twitch',
			chatter_user_id,
			proxiedFragmentIndex !== null
				? message.fragments[proxiedFragmentIndex].text
				: undefined,
		),
	]);

	const messageTemplateClone = cloneTemplate('message-template');
	const messageElement = messageTemplateClone.querySelector('.message');

	// apply data attributes for message deletion reference
	messageElement.setAttribute('data-message-id', message_id);
	messageElement.setAttribute('data-user-id', chatter_user_id);

	// handle dynamic user color
	const userColor = color || getUserColor(chatter_user_id);
	const userTextColor = accessibleTextColor(userColor);
	messageElement.style.setProperty('--dynamic-color', userTextColor);
	messageElement.style.setProperty('--dynamic-bg-color', userColor);

	// handle rainbow background
	let rainbowMessageType = null;

	if (message_type === 'channel_points_highlighted') {
		rainbowMessageType = 'highlighted';
	} else if (message_type === 'power_ups_message_effect') {
		rainbowMessageType = 'power-up';
	} else if (notice_type === 'announcement') {
		rainbowMessageType = 'announcement';
	} else if (!!cheer) {
		rainbowMessageType = 'cheer';
	}

	if (rainbowMessageType) {
		messageElement.dataset.type = rainbowMessageType;
	}

	// build badges
	const badgeClones = buildBadges(badges);
	messageTemplateClone.querySelector('.badges').append(...badgeClones);

	if (proxiedMessage) {
		// apply proxied message styles
		messageElement.classList.add('proxied-message');

		if (proxiedMessage.color) {
			const proxiedTextColor = accessibleTextColor(proxiedMessage.color);
			messageElement.style.setProperty(
				'--proxied-dynamic-color',
				proxiedTextColor,
			);
			messageElement.style.setProperty(
				'--proxied-dynamic-bg-color',
				proxiedMessage.color,
			);
		}

		// build proxied user
		messageTemplateClone
			.querySelector('.user')
			.append(
				buildUserLabel(
					proxiedMessage.member.name,
					chatter_user_login,
					proxiedMessage.pronouns?.split('/') ?? pronouns,
					{ proxied: true },
				),
			);
	}

	// build user
	messageTemplateClone
		.querySelector('.user')
		.append(buildUserLabel(chatter_user_name, chatter_user_login, pronouns));

	// build message text
	const contentElement = messageTemplateClone.querySelector('.content');
	message.fragments.forEach((fragment, index) => {
		if (
			proxiedMessage &&
			proxiedFragmentIndex === index &&
			fragment.type === 'text'
		) {
			// append proxied text fragment
			contentElement.append(
				...buildTextFragments(
					{ type: 'text', text: proxiedMessage.body },
					{ className: 'fragment-proxied' },
				),
			);

			// append original text fragment
			contentElement.append(
				...buildTextFragments(fragment, { className: 'fragment-original' }),
			);
		} else {
			contentElement.append(...buildMessageFragments(fragment));
		}
	});

	if (message_type === 'power_ups_gigantified_emote') {
		// handle gigantify emote
		contentElement.classList.add('emote-gigantic');
	} else {
		// handle dynamic emote sizing
		let emoteCount = 0;
		let emoteOnly = true;
		for (const child of contentElement.children) {
			// ignore original fragment in proxied message for emote counting
			if (child.classList.contains('fragment-original')) {
				continue;
			}

			if (child.textContent.trim()) {
				emoteOnly = false;
				break;
			}

			if (
				child.classList.contains('emote') &&
				// check animated to not double count with static
				child.classList.contains('animated')
			) {
				emoteCount++;
			}
		}

		if (emoteOnly) {
			if (emoteCount > 1) {
				contentElement.classList.add('emote-multi');
			} else {
				contentElement.classList.add('emote-single');
			}
		}
	}

	// wait for all images to load
	await Promise.allSettled(
		[...messageTemplateClone.querySelectorAll('img').values()].map(
			async imageElement => {
				return new Promise(resolve => {
					// image already loaded, resolve immediately
					if (imageElement.complete) {
						resolve();
						return;
					}

					function onLoad() {
						imageElement.removeEventListener('load', onLoad);
						resolve();
					}

					// add onLoad listener to image
					imageElement.addEventListener('load', onLoad);
				});
			},
		),
	);

	setTimeout(
		() => {
			const widgetBody = document.getElementById('widget');

			if (
				// chat cleared
				eventDate < Widget.lastChatClear ||
				// message deleted
				Widget.messagesDeleted.has(message_id) ||
				// user banned or timed out
				eventDate < (Widget.usersCleared.get(chatter_user_id) ?? EPOCH_DATE)
			) {
				// if message was already deleted by the above checks, don't render
				return;
			}

			displayMessage(messageTemplateClone, message_id);

			// sound handling
			const soundSrc = Widget.values.get('sound');
			if (soundSrc) {
				const now = new Date();
				const cooldown = (Widget.values.get('sound-cooldown') ?? 5) * 1000;
				const timeSinceLastSound =
					now.getTime() - Widget.lastPlayedSound.getTime();

				if (timeSinceLastSound > cooldown) {
					// play sound once it passes the cooldown check
					const audio = new Audio(soundSrc);
					audio.volume = Widget.values.get('sound.volume') ?? 0.2;
					audio.play();
					Widget.lastPlayedSound = now;
				}
			}

			// max message handling
			const messages = widgetBody.querySelectorAll('.message:not(.exit)');
			const maxMessages = Widget.values.get('max-messages') ?? 50;
			for (let i = 0; i < messages.length - maxMessages; i++) {
				// hide the oldest visible messages
				const messageElement = messages[i];
				hideMessage(messageElement);
			}

			// message expiration handling
			if (Widget.values.get('expire-messages')) {
				setTimeout(
					() => {
						const messageElement = document
							.getElementById('widget')
							.querySelector(`.message[data-message-id='${message_id}']`);
						if (messageElement) {
							hideMessage(messageElement);
						}
					},
					// hide after this many seconds
					(Widget.values.get('hide-time') ?? 300) * 1000,
				);
			}
		},
		// message delay handling
		(Widget.values.get('delay') || 0) * 1000,
	);
}

/**
 * @param {DocumentFragment} messageTemplateClone
 * @param {string} messageId
 */
function displayMessage(messageTemplateClone, messageId) {
	/** @type {HTMLDivElement} */
	const widgetBody = document.getElementById('widget');

	const resizeObserver = new ResizeObserver((entries, observer) => {
		const entry = entries.pop();
		if (!entry) {
			return;
		}

		observer.disconnect();

		const { inlineSize: width, blockSize: height } = entry.borderBoxSize[0];
		const newMessageElement = entry.target;

		// set enter animation and sizing as soon as message is rendered

		newMessageElement.classList.add('enter');
		[
			// 50 extra pixels just in case
			['message-width', `${Math.ceil(width) + 50}px`],
			['message-height', `${Math.ceil(height) + 50}px`],
			['random-x', Math.random()],
			['random-y', Math.random()],
		].forEach(([cssVarName, value]) => {
			newMessageElement.style.setProperty(`--${cssVarName}`, value);
		});

		const randomEdges = Widget.values.get('edges') ?? ['bottom'];
		if (randomEdges.length > 0) {
			const assignedEdge = randomItem(randomEdges);
			newMessageElement.classList.add(`random-${assignedEdge}`);
		}

		animationsFinished(newMessageElement).finally(() => {
			const hideClipping = Widget.values.get('hide-clipping') ?? true;
			const arrangement = Widget.values.get('arrangement') ?? 'vertical';
			if (hideClipping && !arrangement.startsWith('random')) {
				// handle clipping if not in a random arrangement

				/** @type {NodeListOf<HTMLElement>} */
				const visibleMessages = document
					.getElementById('widget')
					.querySelectorAll('.message:not(.exit)');

				for (const messageElement of visibleMessages) {
					/** @type {HTMLElement} */
					const parent = messageElement.offsetParent;
					const { offsetTop, offsetLeft, offsetHeight, offsetWidth } =
						messageElement;

					const top = offsetTop;
					const left = offsetLeft;
					const bottom = parent.offsetHeight - offsetTop - offsetHeight;
					const right = parent.offsetWidth - offsetLeft - offsetWidth;

					if (top < 0 || left < 0 || bottom < 0 || right < 0) {
						// found message clipping out of bounds
						hideMessage(messageElement);
					} else {
						// all other messages are in bounds, skip processing them
						return;
					}
				}
			}
		});
	});

	// append clone
	widgetBody.appendChild(messageTemplateClone);

	// add observer
	resizeObserver.observe(
		widgetBody.querySelector(`.message[data-message-id='${messageId}']`),
	);
}

/**
 * @param {HTMLElement} messageElement
 */
function hideMessage(messageElement) {
	// immediately remove element from DOM if no animation
	if ((Widget.values.get('exit-animation') ?? 'none') === 'none') {
		messageElement.remove();
		return;
	}

	messageElement.classList.add('exit');

	// automatically remove element after animations finish
	animationsFinished(messageElement).finally(() => {
		messageElement.remove();
	});
}

function handleChatMessageDelete(data) {
	const { message_id } = data;
	Widget.messagesDeleted.add(message_id);
	const messageElement = document
		.getElementById('widget')
		.querySelector(`[data-message-id='${message_id}']`)
		?.remove();
}

function handleChatClear(eventDate) {
	Widget.lastChatClear = eventDate;
	document
		.getElementById('widget')
		.querySelectorAll('.message')
		.forEach(element => element.remove());
}

function handleChatClearUserMessages(data, eventDate) {
	const { target_user_id } = data;
	Widget.usersCleared.set(target_user_id, eventDate);
	document
		.getElementById('widget')
		.querySelectorAll(`[data-user-id='${target_user_id}']`)
		.forEach(element => element.remove());
}

// Element Builders
// ***************************************************************************

/**
 * @param {string} displayName
 * @param {string} username
 * @param {string[] | null} pronouns
 * @param {{ proxied: boolean }} [options]
 * @returns {DocumentFragment}
 */
function buildUserLabel(
	displayName,
	username,
	pronouns,
	{ proxied = false } = {},
) {
	const userClone = cloneTemplate('user-template');

	if (proxied) {
		userClone.querySelector('.user-label').classList.add('user-label-proxied');
	} else if (displayName.toLowerCase() !== username.toLowerCase()) {
		// https://blog.twitch.tv/en/2016/08/22/localized-display-names-e00ee8d3250a/
		userClone
			.querySelector('.user-label')
			.classList.add('user-label-localized');
	}

	userClone.querySelector('.display-name').textContent = displayName;
	userClone.querySelector('.username').textContent = ` (${username})`;

	if (pronouns && pronouns.length > 0) {
		userClone.querySelector('.pronouns').textContent =
			` (${pronouns.join('/')})`;
	}

	return userClone;
}

function buildBadges(badges) {
	return badges.map(userBadge => {
		const badgeVersion = Twitch.badges
			.get(userBadge.set_id)
			?.versions.get(userBadge.id);

		const badgeClone = cloneTemplate('badge-template');

		if (badgeVersion) {
			badgeClone
				.querySelector('.badge')
				.setAttribute('src', badgeVersion.image_url_4x);
		}

		return badgeClone;
	});
}

/** @returns {DocumentFragment[]} */
function buildMessageFragments(fragment) {
	switch (fragment.type) {
		case 'emote':
			return [buildEmoteFragment(fragment)];
		case 'mention':
			return [buildMentionFragment(fragment)];
		case 'cheermote':
			return [buildCheermoteFragment(fragment)];
		case 'text':
		default:
			return buildTextFragments(fragment);
	}
}

/**
 * @param {{ type: 'text'; text: string }} textFragment
 * @param {{ className?: string }} [options]
 * @returns {DocumentFragment[]}
 */
function buildTextFragments(textFragment, { className = undefined } = {}) {
	const { text } = textFragment;

	const parsedFragments = [];

	const thirdPartyEmoteNames = Array.from(Twitch.thirdPartyEmotes.keys());
	text.split(createEmoteRegex(thirdPartyEmoteNames)).forEach(part => {
		// ignore empty strings that occur due to the split
		if (part === '') return;

		const thirdPartyEmote = Twitch.thirdPartyEmotes.get(part) ?? {};

		if (thirdPartyEmote.type === 'bttv') {
			const { id, animated } = thirdPartyEmote.data;
			const srcAnimated = buildBttvEmoteImageUrl(id, animated);
			const srcStatic = buildBttvEmoteImageUrl(id, animated, {
				useStatic: true,
			});
			parsedFragments.push({
				type: 'emote',
				text: part,
				srcAnimated,
				srcStatic,
			});
		} else if (thirdPartyEmote.type === 'ffz') {
			const { urls, animated: animatedUrls } = thirdPartyEmote.data;
			const srcAnimated = buildFfzEmoteImageUrl(urls, animatedUrls);
			const srcStatic = buildFfzEmoteImageUrl(urls, animatedUrls, {
				useStatic: true,
			});
			parsedFragments.push({
				type: 'emote',
				text: part,
				srcAnimated,
				srcStatic,
			});
		} else {
			parsedFragments.push({ type: 'text', text: part });
		}
	});

	return parsedFragments.map(fragment => {
		const fragmentClone =
			fragment.type === 'emote'
				? buildParsedEmoteFragment(fragment, { className })
				: buildParsedTextFragment(fragment, { className });
		return fragmentClone;
	});
}

/**
 * @param {{ type: 'text'; text: string }} parsedTextFragment
 * @param {{ className?: string }} [options]
 * @returns {DocumentFragment}
 */
function buildParsedTextFragment(
	parsedTextFragment,
	{ className = undefined } = {},
) {
	const { text } = parsedTextFragment;

	const textClone = cloneTemplate('text-fragment-template');
	textClone.querySelector('.text').textContent = text;
	if (className) {
		textClone.querySelector('.text').classList.add(className);
	}

	return textClone;
}

function buildMentionFragment(mentionFragment) {
	const { mention } = mentionFragment;

	const mentionClone = cloneTemplate('mention-fragment-template');
	mentionClone.querySelector('.mention').textContent = `@${mention.user_login}`;

	return mentionClone;
}

function buildEmoteFragment(emoteFragment) {
	const { text, emote } = emoteFragment;

	let srcAnimated = buildTwitchEmoteImageUrl(emote.id);
	let srcStatic = buildTwitchEmoteImageUrl(emote.id, { format: 'static' });

	const thirdPartyEmote = Twitch.thirdPartyEmotes.get(text) ?? {};

	// allow third party emotes to override twitch emotes
	if (thirdPartyEmote.type === 'bttv') {
		const { id, animated } = thirdPartyEmote.data;
		srcAnimated = buildBttvEmoteImageUrl(id, animated);
		srcStatic = buildBttvEmoteImageUrl(id, animated, { useStatic: true });
	} else if (thirdPartyEmote.type === 'ffz') {
		const { urls, animated: animatedUrls } = thirdPartyEmote.data;
		srcAnimated = buildFfzEmoteImageUrl(urls, animatedUrls);
		srcStatic = buildFfzEmoteImageUrl(urls, animatedUrls, { useStatic: true });
	}

	return buildParsedEmoteFragment({
		type: 'emote',
		text,
		srcAnimated,
		srcStatic,
	});
}

/**
 * @param {{
 * 	type: 'emote';
 * 	text: string;
 * 	srcAnimated: string;
 * 	srcStatic: string;
 * }} parsedEmoteFragment
 * @param {{ className?: string }} [options]
 * @returns {DocumentFragment}
 */
function buildParsedEmoteFragment(
	parsedEmoteFragment,
	{ className = undefined } = {},
) {
	const { srcAnimated, srcStatic } = parsedEmoteFragment;

	const emoteClone = cloneTemplate('emote-fragment-template');
	emoteClone.querySelector('.emote.animated').src = srcAnimated;
	emoteClone.querySelector('.emote.static').src = srcStatic;
	if (className) {
		emoteClone.querySelectorAll('.emote').forEach(emoteElement => {
			emoteElement.classList.add(className);
		});
	}

	return emoteClone;
}

function buildCheermoteFragment(cheermoteFragment) {
	const { cheermote } = cheermoteFragment;

	const cheermoteClone = cloneTemplate('cheermote-fragment-template');

	const tier = Twitch.cheermotes
		.get(cheermote.prefix)
		?.tiers.get(cheermote.tier);

	if (tier) {
		cheermoteClone.querySelector('.cheermote.animated').src =
			tier.images.dark.animated['4'];
		cheermoteClone.querySelector('.cheermote.static').src =
			tier.images.dark.static['4'];
		cheermoteClone.querySelector('.cheer-amount').textContent = cheermote.bits;
		cheermoteClone
			.querySelector('.cheer-amount')
			.style.setProperty('color', tier.color);
	}

	return cheermoteClone;
}

// Requests
// ***************************************************************************

/**
 * Returns array of pronouns to show, or `null` if they haven't set any.
 *
 * @param {'twitch'} platform
 * @param {string} userId
 * @param {string} username
 * @returns {Promise<string[] | null>}
 */
async function getPronouns(platform, userId, username) {
	return slime2.request('get-pronouns', {
		platform,
		user_id: userId,
		username,
	});
}

/**
 * Returns proxy information for the message, or `null` if this isn't a message
 * sent by a system member.
 *
 * @param {'twitch'} platform
 * @param {string} userId
 * @param {string} [message]
 * @returns {Promise<Object | null>}
 *   https://docs.pluralmind.chat/api/interfaces/ProxiedMessage.html
 */
async function getSystemProxiedMessage(platform, userId, message) {
	if (!message) return null;

	return slime2.request('get-system-proxied-message', {
		platform,
		user_id: userId,
		message,
	});
}

/**
 * Returns ISO string of follow date, or `null` if they aren't following.
 *
 * @param {string} userId
 * @returns {Promise<string | null>}
 */
async function getTwitchFollowDate(userId) {
	return slime2.request('get-twitch-follow-date', {
		account_id: Widget.readAccount.id,
		user_id: userId,
	});
}

/**
 * Returns array of Twitch Cheermotes.
 * https://dev.twitch.tv/docs/api/reference/#get-cheermotes
 *
 * @returns {Promise<Object[]>}
 */
async function getTwitchCheermotes() {
	return slime2.request('get-twitch-cheermotes', {
		account_id: Widget.readAccount.id,
	});
}

/**
 * Returns array of Twitch Global Badges.
 * https://dev.twitch.tv/docs/api/reference/#get-global-chat-badges
 *
 * @returns {Promise<Object[]>}
 */
async function getTwitchGlobalBadges() {
	return slime2.request('get-twitch-global-badges', {
		account_id: Widget.readAccount.id,
	});
}

/**
 * Returns array of Twitch Channel Chat Badges.
 * https://dev.twitch.tv/docs/api/reference/#get-channel-chat-badges
 *
 * @returns {Promise<Object[]>}
 */
async function getTwitchChannelChatBadges() {
	return slime2.request('get-twitch-channel-chat-badges', {
		account_id: Widget.readAccount.id,
	});
}

/**
 * Returns BetterTTV Twitch User, or `null` if user hasn't set BTTV emotes.
 * https://betterttv.com/developers/api#user
 *
 * @returns {Promise<Object | null>}
 */
async function getBttvUser() {
	return slime2.request('get-betterttv-user', {
		account_id: Widget.readAccount.id,
		platform: 'twitch',
	});
}

/**
 * Returns FrankerFaceZ Twitch Room, or `null` if user hasn't set FFZ emotes.
 * https://api.frankerfacez.com/docs/#/Rooms
 *
 * @returns {Promise<Object | null>}
 */
async function getFfzRoom() {
	return slime2.request('get-frankerfacez-room', {
		account_id: Widget.readAccount.id,
		platform: 'twitch',
	});
}

// Helpers
// ***************************************************************************

/** Returns true if user passes the min follow age check */
async function checkFollowAge(userId, eventDate) {
	if (!Widget.values.get('follower-only')) {
		// not in follower only mode, allow everyone
		return true;
	}

	const followDateString = await getTwitchFollowDate(userId);
	if (!followDateString) {
		// user isn't a follower
		return false;
	}

	const followDate = new Date(followDateString);

	// follow age given in hours
	const minFollowTime = (Widget.values.get('follow-age') ?? 0) * 60 * 60 * 1000;
	const userFollowTime = eventDate.getTime() - followDate.getTime();

	return userFollowTime > minFollowTime;
}

const BASE_TWITCH_EMOTE_URL = 'https://static-cdn.jtvnw.net/emoticons/v2';
/**
 * Builds Twitch emote image URL given the emote ID.
 *
 * @param {string} id - Emote ID
 * @param {Object} [options={}] - Format options. Default is `{}`
 * @param {'default' | 'static' | 'animated'} [options.format]
 * @param {'dark' | 'light'} [options.theme_mode]
 * @param {'1.0' | '2.0' | '3.0'} [options.size]
 */
function buildTwitchEmoteImageUrl(
	id,
	{ format = 'default', theme_mode = 'dark', size = '3.0' } = {},
) {
	return [BASE_TWITCH_EMOTE_URL, id, format, theme_mode, size].join('/');
}

const BASE_BTTV_EMOTE_URL = 'https://cdn.betterttv.net/emote';
/**
 * Builds BetterTTV emote image URL given the emote ID and animated value
 *
 * @param {string} id - Emote ID
 * @param {boolean} hasAnimatedVariant - If the emote has an animated variant
 * @param {Object} [options] - Format options
 * @param {boolean} [options.useStatic]
 * @param {'1x' | '2x' | '3x'} [options.size]
 */
function buildBttvEmoteImageUrl(
	id,
	hasAnimatedVariant,
	{ useStatic = false, size = '3x' } = {},
) {
	const urlParts = [BASE_BTTV_EMOTE_URL, id];

	// static only works if the emote was animated
	if (hasAnimatedVariant && useStatic) urlParts.push('static');

	urlParts.push(size);
	return urlParts.join('/');
}

/**
 * Builds FrankerFaceZ emote image URL given the possible URLs
 *
 * @param {{ '1': string; '2': string | null; '4': string | null }} urls
 * @param {{ '1': string; '2': string | null; '4': string | null }} [animatedUrls]
 * @param {Object} [options] - Format options
 * @param {boolean} [options.useStatic]
 * @param {'1' | '2' | '4'} [options.size]
 */
function buildFfzEmoteImageUrl(
	urls,
	animatedUrls,
	{ useStatic = false, size = '4' } = {},
) {
	// urls['1'] is guaranteed, the others are not
	let url = urls['1'];

	if (!useStatic) {
		url = animatedUrls?.['1'] || url;
	}

	if (size !== '1') {
		url = urls['2'] || url;
		if (!useStatic) {
			url = animatedUrls?.['2'] || url;
		}

		if (size === '4') {
			url = urls['4'];
			if (!useStatic) {
				url = animatedUrls?.['4'] || url;
			}
		}
	}

	return url;
}

/**
 * Given the ID of an HTML template, returns a copy of its DocumentFragment contents
 *
 * @param {string} id
 * @returns {DocumentFragment}
 */
function cloneTemplate(id) {
	/** @type {HTMLTemplateElement} */
	const element = document.getElementById(id);

	if (!element) {
		throw Error(`Template with id "${id}" not found!`);
	}

	if (element.tagName !== 'TEMPLATE') {
		throw Error(`Element with id "${id}" is not a template!`);
	}

	return document.importNode(element.content, true);
}

/**
 * Returns a Promise that resolves when all of the animations
 * on this element have finished playing.
 *
 * @param {HTMLElement} element
 */
async function animationsFinished(element) {
	return Promise.allSettled(
		element.getAnimations().map(animation => {
			return animation.finished;
		}),
	);
}

/**
 * Given an array, returns a random item from that array.
 * @param {T[]} array
 * @returns {T}
 */
function randomItem(array) {
	return array[Math.floor(Math.random() * array.length)];
}

/**
 * Given a background color, returns 'white' or 'black', depending on which would be a more accessible text color on it using Color.js APCA
 * @param {string} backgroundColor
 * @returns {'black' | 'white'}
 */
function accessibleTextColor(backgroundColor) {
	const [blackContrast, whiteContrast] = ['black', 'white'].map(textColor => {
		return Math.abs(Color.contrastAPCA(backgroundColor, textColor));
	});

	return blackContrast > whiteContrast ? 'black' : 'white';
}

/**
 * Gets cached randomized color for this user.
 * @param {string} userId
 */
function getUserColor(userId) {
	let color = Widget.userColors.get(userId);
	if (!color) {
		// color not yet assigned, pick a random color from DEFAULT_COLORS
		color = randomItem(DEFAULT_COLORS);
		Widget.userColors.set(color);
	}
	return color;
}

/**
 * When this regex is used in {@link String.prototype.split}, it will result in
 * an array of strings split up by the emote names, with the emote names
 * included. If an emote name is at the beginning or end of the string, then the
 * array will include an empty string at the beginning or end.
 *
 * Examples:
 *
 *     const regex = createEmoteRegex(['emote', 'emote2']);
 *     'aaa emote aaa'.split(regex) === ['aaa ', 'emote', ' aaa'];
 *     'emote emote2'.split(regex) === ['', 'emote', '', 'emote2', ''];
 *     ',emote!'.split(regex) === [',', 'emote', '!'];
 *     'emoteemote2'.split(regex) === ['emoteemote2'];
 */
function createEmoteRegex(emoteNames) {
	// regex escape every emote name, and join with the regex OR character
	const regexPart = emoteNames
		.map(emoteName => {
			return escapeRegExp(emoteName);
		})
		.join('|');

	/**
	 * Explaining this regex so that I know how it works in the future...
	 *
	 * These are all valid to go directly before or after an emote:
	 *
	 * | Regex   | Explanation                        |
	 * | ------- | ---------------------------------- |
	 * | `\s`    | any whitespace character           |
	 * | `^`     | beginning of the string            |
	 * | `$`     | end of the string                  |
	 * | `[.,!]` | period, comma, or exclamation mark |
	 *
	 * These match a group without including it in the result:
	 *
	 * | Regex  | Explanation                                                      |
	 * | ------ | ---------------------------------------------------------------- |
	 * | (?<= ) | Positive lookbehind. Matches a group before the main expression. |
	 * | (?= )  | Positive lookahead. Matches a group after the main expression.   |
	 */
	const regex = String.raw`(?<=\s|[.,!]|^)(${regexPart})(?=\s|[.,!]|$)`;
	return new RegExp(regex, 'g');
}

/**
 * Escapes all characters that have special functionality in regex by inserting
 * a backslash before them
 *
 * Characters escaped: . * + ? ^ $ { } ( ) | [ ] \
 */
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
