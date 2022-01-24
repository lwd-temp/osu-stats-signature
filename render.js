import fs from 'fs';
import path from 'path';
import cheerio from 'cheerio';
import TextToSVG from 'text-to-svg';
import Color from 'color';
import * as libs from './libs.js';
const __dirname = path.resolve();
const textToSVGRegular = TextToSVG.loadSync(path.join(__dirname, '/assets/fonts/Comfortaa/Comfortaa-Regular.ttf'));
const textToSVGBold = TextToSVG.loadSync(path.join(__dirname, '/assets/fonts/Comfortaa/Comfortaa-Bold.ttf'));

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export const getSVGTemplete = (type, language) => {
	try{
		return fs.readFileSync(path.join(__dirname, `/assets/svg_template/${type}/template_${language}.svg`), 'utf8');
	}catch(e){
		return fs.readFileSync(path.join(__dirname, `/assets/svg_template/${type}/template_cn.svg`), 'utf8');
	}
	
}
export const getSVGContent = (x) => {
	return fs.readFileSync(path.join(__dirname, x), 'utf8');
}

const getTransformedX = (x, w, anchor = 'center') => {
	switch (anchor) {
		case 'left':
			return x - 550 / 2 + w / 2;
		case 'right':
			return x - 550 / 2 + w;
		default:
			return x - 550 / 2;
	}
}
const getTransformedXMini = (x, w, anchor = 'center') => {
	switch (anchor) {
		case 'left':
			return x - 400 / 2 + w / 2;
		case 'right':
			return x - 400 / 2 + w;
		default:
			return x - 400 / 2;
	}
}

export const getFlagSVG = (countryCode, x, y, h) => {
	let svg = libs.getFlagSVGByCountryCode(countryCode);
	let $ = cheerio.load(svg);
	$('svg').attr('x', getTransformedX(x, h * 0.72, 'left'));
	$('svg').attr('y', y);
	$('svg').attr('height', h);
	return $.html('svg');
}
export const getFlagSVGMini = (countryCode, x, y, h) => {
	let svg = libs.getFlagSVGByCountryCode(countryCode);
	let $ = cheerio.load(svg);
	$('svg').attr('x', getTransformedXMini(x, h * 0.72, 'left'));
	$('svg').attr('y', y);
	$('svg').attr('height', h);
	return $.html('svg');
}
export const getPlaymodeSVG = (playmode, x, y, h) => {
	let svg = libs.getPlaymodeSVG(playmode);
	let $ = cheerio.load(svg);
	$('svg').attr('x', getTransformedX(x, h, 'left'));
	$('svg').attr('y', y);
	$('svg').attr('height', h);
	return $.html('svg');
}
export const getPlaymodeSVGMini = (playmode, x, y, h) => {
	let svg = libs.getPlaymodeSVG(playmode);
	let $ = cheerio.load(svg);
	$('svg').attr('x', getTransformedXMini(x, h, 'left'));
	$('svg').attr('y', y);
	$('svg').attr('height', h);
	return $.html('svg');
}
export const getSupporterSVG = (x, y, h, level = 1) => {
	let svg = fs.readFileSync(path.join(__dirname, `/assets/icons/supporter_${level}.svg`), 'utf8');
	let $ = cheerio.load(svg);
	let viewBoxW = parseFloat($(svg).attr('viewBox').split(' ')[2]);
	let viewBoxH = parseFloat($(svg).attr('viewBox').split(' ')[3]);
	let scale = h / viewBoxH;
	$('svg').attr('x', getTransformedX(x, viewBoxW * scale, 'left'));
	$('svg').attr('y', y);
	$('svg').attr('height', h);
	return $.html('svg');
}

export const getTextSVGPath = (TextToSVGObj, text, x, y, size, anchor = 'left top') => {
	let path = TextToSVGObj.getPath(text, {
		x: x,
		y: y,
		fontSize: size,
		anchor: anchor,
		fontFamily: 'Comfortaa',
		attributes: {
			fill: '#fff'
		}
	});
	return path;
}
export const getTextSVGMetrics = (TextToSVGObj, text, x, y, size, anchor = 'left top') => {
	let metrics = TextToSVGObj.getMetrics(text, {
		x: x,
		y: y,
		fontSize: size,
		anchor: anchor,
		fontFamily: 'Comfortaa',
		attributes: {
			fill: '#fff'
		}
	});
	return metrics;
}

const replaceCalcedColors = (data, svg) => {
	let baseHue = data.options.color_hue;

	svg = svg.replace('{{hsl-b5}}', new Color(`hsl(${baseHue}, 10%, 15%)`).hex());
	svg = svg.replace('{{hsl-b4}}', new Color(`hsl(${baseHue}, 10%, 20%)`).hex());
	svg = svg.replace('{{hsl-h1}}', new Color(`hsl(${baseHue}, 100%, 70%)`).hex());

	return svg;
}
const replaceRoundAvatarClipPath = (data, ismini, svg) => {
	if (!data.options.round_avatar) {
		return svg;
	}
	if (ismini) {
		svg = svg.replace(/<path id="avatar_clip"(.*?)\/>/, '<circle id="avatar_clip" class="cls-1" cx="61" cy="6" r="45"/>');
	}else{
		svg = svg.replace(/<path id="avatar_clip"(.*?)\/>/, '<circle id="avatar_clip" class="cls-4" cx="62.5" cy="60.5" r="42.2"/>');
	}
	return svg;
}
const minifySVG = (svg) => {
	svg = svg.replace(/\t/g, '');
	svg = svg.replace(/\n/g, '');
	svg = svg.replace(/\r/g, '');
	svg = svg.replace(/\s+/g, ' ');

	svg = '<!-- Generated by osu-stats-signature -->\n<!-- https://github.com/solstice23/osu-stats-signature -->\n' + svg;
	return svg;
}

export const getRenderedSVGFull = (data, avatarBase64, userCoverImageBase64) => {
	let templete = getSVGTemplete('full', data.options.language);
	let user = data.user;

	//尺寸
	templete = templete.replace('{{width}}', data.options.size.width);
	templete = templete.replace('{{height}}', data.options.size.height);

	//动画
	templete = templete.replace('{{fg-extra-class}}', data.options.animation ? "animation-enabled" : "");

	//颜色
	templete = replaceCalcedColors(data, templete);

	//圆头像
	templete = replaceRoundAvatarClipPath(data, false, templete);


	//名字
	templete = templete.replace('{{name}}', getTextSVGPath(textToSVGBold, user.username, 130, 20, 28));
	let nameWidth = getTextSVGMetrics(textToSVGBold, user.username, 130, 20, 28).width;
	//Support Tag
	if (user.is_supporter){
		templete = templete.replace('{{supporter-tag}}', getSupporterSVG(130 + nameWidth + 10, 24, 22, user.support_level));
	}else{
		templete = templete.replace('{{supporter-tag}}', '');
	}

	//头像和封面
	templete = templete.replace('{{avatar-base64}}', avatarBase64);
	templete = templete.replace('{{user-cover-base64}}', userCoverImageBase64);

	//国旗和国家名
	templete = templete.replace('{{flag}}', getFlagSVG(user.country_code, 135, 56, 20));
	templete = templete.replace('{{country}}', getTextSVGPath(textToSVGRegular, user.country.name, 161, 59.5, 14));

	//模式
	templete = templete.replace('{{playmode-icon}}', getPlaymodeSVG(data.current_mode, 130, 88, 15));
	templete = templete.replace('{{playmode}}', getTextSVGPath(textToSVGRegular, libs.getPlaymodeFullName(data.current_mode), 150, 89, 12));

	//等级
	templete = templete.replace('{{level}}', getTextSVGPath(textToSVGBold, user.statistics.level.current.toString(), 290, 143, 12, 'center middle'));
	templete = templete.replace('{{level-percent}}', getTextSVGPath(textToSVGRegular, user.statistics.level.progress + "%", 259.5, 145, 9, 'right top'));
	templete = templete.replace('{{level-bar-fg}}', `<path class="cls-10" d="M20,135a2.5,2.5,0,0,0,2.5,2.5H${clamp(Math.round(user.statistics.level.progress / 100 * (256 - 21) + 21), 21, 256)}.833a2.5,2.5,0,0,0,0-5H22.5A2.5,2.5,0,0,0,20,135Z" transform="translate(0 2)" />`);

	//成绩计数
	const gradesName = ["ssh", "ss", "sh", "s", "a"];
	let gradeTextX = 360.7;
	for (let grade of gradesName) {
		templete = templete.replace(`{{${grade}-count}}`, getTextSVGPath(textToSVGRegular, user.statistics.grade_counts[grade].toString(), gradeTextX, 153, 9, 'center middle'));
		gradeTextX += 38.62;
	}

	//pp
	templete = templete.replace('{{pp}}', getTextSVGPath(textToSVGRegular, libs.formatNumber(Math.round(user.statistics.pp)), 20, 202, 13));

	//奖章
	templete = templete.replace('{{medals}}', getTextSVGPath(textToSVGRegular, libs.formatNumber(user.user_achievements.length), 82, 202, 13));

	//游戏时间
	templete = templete.replace('{{playtime}}', getTextSVGPath(textToSVGRegular, libs.formatPlaytime(user.statistics.play_time), 126, 202, 13));

	//全球排名/区内排名
	let globalRanking = libs.formatNumber(user.statistics.global_rank, '#');
	templete = templete.replace('{{global-ranking}}', getTextSVGPath(textToSVGRegular, globalRanking, 268, 211, globalRanking.length < 10 ? 27 : 25));
	templete = templete.replace('{{country-ranking}}', getTextSVGPath(textToSVGRegular, libs.formatNumber(user.statistics.country_rank, '#'), 269, 277, 17));

	//其他统计信息
	const statsName = ["ranked_score", "play_count", "total_score", "total_hits", "replays_watched_by_others"];
	let statsTextY = 227;
	for (let stat of statsName) {
		templete = templete.replace(`{{${stat.replace(/_/g, '-')}}}`, getTextSVGPath(textToSVGRegular, libs.formatNumber(user.statistics[stat]), 218, statsTextY, 10, 'right top'));
		statsTextY += 16;
	}

	//acc
	templete = templete.replace('{{acc}}', getTextSVGPath(textToSVGRegular, user.statistics.hit_accuracy.toFixed(2).toString() + "%", 424, 202, 13));
	//最大连击
	templete = templete.replace('{{max-combo}}', getTextSVGPath(textToSVGRegular, libs.formatNumber(user.statistics.maximum_combo) + "x", 483, 202, 13));
	//bp
	templete = templete.replace('{{bp}}', getTextSVGPath(textToSVGRegular, libs.formatNumber(Math.round(data.extras?.scoresBest[0]?.pp ?? 0)) + "pp", 424, 249, 13));
	//第一名
	templete = templete.replace('{{first-place}}', getTextSVGPath(textToSVGRegular, libs.formatNumber(user.scores_first_count), 483, 249, 13));

	return minifySVG(templete);
}

export const getRenderedSVGMini = (data, avatarBase64, userCoverImageBase64) => {
	let templete = getSVGTemplete('mini', data.options.language);
	let user = data.user;

	//尺寸
	templete = templete.replace('{{width}}', data.options.size.width);
	templete = templete.replace('{{height}}', data.options.size.height);

	//动画
	templete = templete.replace('{{fg-extra-class}}', data.options.animation ? "animation-enabled" : "");

	//颜色
	templete = replaceCalcedColors(data, templete);

	//圆头像
	templete = replaceRoundAvatarClipPath(data, false, templete);


	//名字
	templete = templete.replace('{{name}}', getTextSVGPath(textToSVGBold, user.username, 118, 14, 25));

	//头像和封面
	templete = templete.replace('{{avatar-base64}}', avatarBase64);
	templete = templete.replace('{{user-cover-base64}}', userCoverImageBase64);

	//国旗
	templete = templete.replace('{{flag}}', getFlagSVGMini(user.country_code, 368, 8, 18));
	
	//区内排名
	templete = templete.replace('{{country-ranking}}', getTextSVGPath(textToSVGRegular, libs.formatNumber(user.statistics.country_rank, '#'), 360, 12, 10, 'right top'));

	//模式
	templete = templete.replace('{{playmode-icon}}', getPlaymodeSVGMini(data.current_mode, 372, 30, 12));

	//等级
	templete = templete.replace('{{level}}', getTextSVGPath(textToSVGRegular, 'lv.' + user.statistics.level.current.toString(), 369, 31, 10, 'right top'));

	//全球排名
	let globalRanking = libs.formatNumber(user.statistics.global_rank, '#');
	templete = templete.replace('{{global-ranking}}', getTextSVGPath(textToSVGRegular, globalRanking, 120, 86, globalRanking.length < 10 ? 18 : 17));

	//pp
	templete = templete.replace('{{pp}}', getTextSVGPath(textToSVGRegular, libs.formatNumber(Math.round(user.statistics.pp)), 226, 81.5, 13));
	//acc
	templete = templete.replace('{{acc}}', getTextSVGPath(textToSVGRegular, user.statistics.hit_accuracy.toFixed(2).toString() + "%", 281, 81.5, 13));
	//游戏次数
	templete = templete.replace('{{play-count}}', getTextSVGPath(textToSVGRegular, libs.formatNumber(user.statistics.play_count), 336, 81.5, 13));
	
	return minifySVG(templete);
}

export const getErrorSVG = (err) => {
	return textToSVGRegular.getSVG(err, {
		x: 0,
		y: 0,
		fontSize: 30,
		anchor: 'left top',
		attributes: {
			fill: '#ff66ab'
		}
	});
}