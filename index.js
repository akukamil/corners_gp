let M_WIDTH=800, M_HEIGHT=450;
let app ={stage:{},renderer:{}}, assets={}, SERVER_TM=0,fbs,client_id, objects={}, state="", my_role="", game_tick=0, made_moves=0, my_turn=0, connected = 1, LANG = 0, min_move_amount=0, h_state=0, game_platform="",git_src='', ROOM_NAME = '', g_board=[], players="",moving_chip=null, pending_player="",tm={}, some_process={}, my_data={opp_id : ''},opp_data={}, game_name='corners';
const WIN = 1, DRAW = 0, LOSE = -1, NOSYNC = 2;
const MAX_NO_AUTH_RATING=1950;
const MAX_NO_REP_RATING=1910;
const MAX_NO_CONF_RATING=1950;
const DAYS_TO_CONF_RATING=7;
const COM_URL='https://akukamil.github.io/com'

let TM={s:0,ms:0}

DESIGN_DATA={
	0:{name:'def',rating:0,games:0},
	1:{name:'old',rating:0,games:0},
	2:{name:'ice',rating:1500,games:1000},
	3:{name:'grass',rating:1700,games:5000},
	4:{name:'wood',rating:1900,games:15000},
	5:{name:'neon',rating:0,games:0,trnm_winner:1}
}

my_log={
	log_arr:[],
	add(data){
		this.log_arr.push(data);
		if (this.log_arr.length>40)
			this.log_arr.shift();
	}

};

fbs_once=async function(path){
	const info=await fbs.ref(path).get();
	return info.val();
}

irnd = function(min,max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class player_mini_card_class extends PIXI.Container {

	constructor(x,y,id) {
		super();
		this.visible=false;
		this.id=id;
		this.uid=0;
		this.type = 'single';
		this.x=x;
		this.y=y;


		this.bcg=new PIXI.Sprite(assets.mini_player_card);
		this.bcg.width=200;
		this.bcg.height=90;
		this.bcg.interactive=true;
		this.bcg.buttonMode=true;
		this.bcg.pointerdown=function(){lobby.card_down(id)};

		this.table_rating_hl=new PIXI.Sprite(assets.table_rating_hl);
		this.table_rating_hl.width=200;
		this.table_rating_hl.height=90;
		

		this.icon=new PIXI.Sprite(assets.cup_icon)
		this.icon.width=40
		this.icon.height=40
		this.icon.x=82
		this.icon.y=43
		this.icon.visible=false

		this.avatar=new PIXI.Graphics();
		this.avatar.x=16;
		this.avatar.y=16;
		this.avatar.w=this.avatar.h=58.2;

		this.avatar_frame=new PIXI.Sprite(assets.chat_avatar_frame_img);
		this.avatar_frame.x=16-11.64;
		this.avatar_frame.y=16-11.64;
		this.avatar_frame.width=this.avatar_frame.height=81.48;

		this.name="";
		this.name_text=new PIXI.BitmapText('', {fontName: 'bahnschrift48s',fontSize: 22,align: 'center'});
		this.name_text.anchor.set(1,0);
		this.name_text.x=180;
		this.name_text.y=20;
		this.name_text.tint=0xffffff;

		this.rating=0;
		this.rating_text=new PIXI.BitmapText('', {fontName: 'bahnschrift48s',fontSize: 30,align: 'center'});
		this.rating_text.tint=0xffff00;
		this.rating_text.anchor.set(1,0.5);
		this.rating_text.x=180;
		this.rating_text.y=60;
		this.rating_text.tint=0xffff00;

		//аватар первого игрока
		this.avatar1=new PIXI.Graphics();
		this.avatar1.x=19;
		this.avatar1.y=16;
		this.avatar1.w=this.avatar1.h=58.2;

		this.avatar1_frame=new PIXI.Sprite(assets.chat_avatar_frame_img);
		this.avatar1_frame.x=this.avatar1.x-11.64;
		this.avatar1_frame.y=this.avatar1.y-11.64;
		this.avatar1_frame.width=this.avatar1_frame.height=81.48;

		//аватар второго игрока
		this.avatar2=new PIXI.Graphics();
		this.avatar2.x=121;
		this.avatar2.y=16;
		this.avatar2.w=this.avatar2.h=58.2;

		this.avatar2_frame=new PIXI.Sprite(assets.chat_avatar_frame_img);
		this.avatar2_frame.x=this.avatar2.x-11.64;
		this.avatar2_frame.y=this.avatar2.y-11.64;
		this.avatar2_frame.width=this.avatar2_frame.height=81.48;


		this.rating_text1=new PIXI.BitmapText('', {fontName: 'bahnschrift48s',fontSize: 24,align: 'center'});
		this.rating_text1.tint=0xffff00;
		this.rating_text1.anchor.set(0.5,0);
		this.rating_text1.x=48.1;
		this.rating_text1.y=56;

		this.rating_text2=new PIXI.BitmapText('', {fontName: 'bahnschrift48s',fontSize: 24,align: 'center'});
		this.rating_text2.tint=0xffff00;
		this.rating_text2.anchor.set(0.5,0);
		this.rating_text2.x=150.1;
		this.rating_text2.y=56;

		this.name1="";
		this.name2="";

		this.addChild(this.bcg,this.avatar,this.icon,this.avatar_frame,this.avatar1, this.avatar1_frame, this.avatar2,this.avatar2_frame,this.rating_text,this.table_rating_hl,this.rating_text1,this.rating_text2, this.name_text);
	}

}

class lb_player_card_class extends PIXI.Container{

	constructor(x,y,place) {
		super();

		this.bcg=new PIXI.Sprite(assets.lb_player_card_bcg)
		this.bcg.width = 370
		this.bcg.height = 70

		this.place=new PIXI.BitmapText('', {fontName: 'bahnschrift48s',fontSize: 25,align: 'center'})
		this.place.tint=0xffff00
		this.place.x=20
		this.place.y=22

		this.avatar=new PIXI.Sprite()
		this.avatar.x=43
		this.avatar.y=12
		this.avatar.width=this.avatar.height=45


		this.name=new PIXI.BitmapText('', {fontName: 'bahnschrift48s',fontSize: 25,align: 'center'})
		this.name.tint=0xdddddd
		this.name.x=105
		this.name.y=22


		this.rating=new PIXI.BitmapText('', {fontName: 'bahnschrift48s',fontSize: 25,align: 'center'})
		this.rating.x=298
		this.rating.tint=0xfff2cc
		this.rating.y=22

		this.pivot.y=35

		this.addChild(this.bcg,this.place, this.avatar, this.name, this.rating)
	}


}

class chat_record_class extends PIXI.Container {

	constructor() {

		super();

		this.tm=0;
		this.uid='';



		this.avatar = new PIXI.Graphics();
		this.avatar.w=50;
		this.avatar.h=50;
		this.avatar.x=30;
		this.avatar.y=13;

		this.avatar_bcg = new PIXI.Sprite(assets.chat_avatar_bcg_img);
		this.avatar_bcg.width=70;
		this.avatar_bcg.height=70;
		this.avatar_bcg.x=this.avatar.x-10;
		this.avatar_bcg.y=this.avatar.y-10;
		this.avatar_bcg.interactive=true;
		this.avatar_bcg.pointerdown=()=>chat.avatar_down(this);

		this.avatar_frame = new PIXI.Sprite(assets.chat_avatar_frame_img);
		this.avatar_frame.width=70;
		this.avatar_frame.height=70;
		this.avatar_frame.x=this.avatar.x-10;
		this.avatar_frame.y=this.avatar.y-10;

		this.name = new PIXI.BitmapText('Имя Фамил', {fontName: 'bahnschrift48s',fontSize: 17});
		this.name.anchor.set(0,0.5);
		this.name.x=this.avatar.x+72;
		this.name.y=this.avatar.y-1;
		this.name.tint=0xFBE5D6;

		this.gif=new PIXI.Sprite();
		this.gif.x=this.avatar.x+65;
		this.gif.y=22;

		this.gif_bcg=new PIXI.Graphics();
		this.gif_bcg.beginFill(0x111111)
		this.gif_bcg.drawRect(0,0,1,1);
		this.gif_bcg.x=this.gif.x+3;
		this.gif_bcg.y=this.gif.y+3;
		this.gif_bcg.alpha=0.5;



		this.msg_bcg = new PIXI.NineSlicePlane(assets.msg_bcg,50,18,50,28);
		//this.msg_bcg.width=160;
		//this.msg_bcg.height=65;
		this.msg_bcg.scale_xy=0.66666;
		this.msg_bcg.x=this.avatar.x+45;
		this.msg_bcg.y=this.avatar.y+2;

		this.msg = new PIXI.BitmapText('Имя Фамил', {fontName: 'bahnschrift48s',fontSize: 19,lineSpacing:48,align: 'left'});
		this.msg.x=this.avatar.x+75;
		this.msg.y=this.avatar.y+30;
		this.msg.maxWidth=450;
		this.msg.anchor.set(0,0.5);
		this.msg.tint = 0xffffff;

		this.msg_tm = new PIXI.BitmapText('28.11.22 12:31', {fontName: 'bahnschrift48s',fontSize: 15});
		this.msg_tm.tint=0x999999;
		this.msg_tm.anchor.set(1,0);

		this.visible = false;
		this.addChild(this.msg_bcg,this.gif_bcg,this.gif,this.avatar_bcg,this.avatar,this.avatar_frame,this.name,this.msg,this.msg_tm);

	}

	nameToColor(name) {
		  // Create a hash from the name
		  let hash = hf.hash(name)

		  // Generate a color from the hash
		  let color = ((hash >> 24) & 0xFF).toString(16) +
					  ((hash >> 16) & 0xFF).toString(16) +
					  ((hash >> 8) & 0xFF).toString(16) +
					  (hash & 0xFF).toString(16);

		  // Ensure the color is 6 characters long
		  color = ('000000' + color).slice(-6);

		  // Convert the hex color to an RGB value
		  let r = parseInt(color.slice(0, 2), 16);
		  let g = parseInt(color.slice(2, 4), 16);
		  let b = parseInt(color.slice(4, 6), 16);

		  // Ensure the color is bright enough for a black background
		  // by normalizing the brightness.
		  if ((r * 0.299 + g * 0.587 + b * 0.114) < 128) {
			r = Math.min(r + 128, 255);
			g = Math.min(g + 128, 255);
			b = Math.min(b + 128, 255);
		  }

		  return (r << 16) + (g << 8) + b;
	}

	update_avatar(uid, tar_sprite) {

		//определяем pic_url
		const pdata=players_cache.get_pdata(uid)
		if(pdata)
			tar_sprite.set_texture(pdata.texture)
		else
			players_cache.update(uid,{source:'chat'})
	}

	async set(msg_data) {

		//получаем pic_url из фб
		this.avatar.set_texture(PIXI.Texture.WHITE);

		if (msg_data.uid==='admin'){
			this.msg_bcg.tint=0x55ff55;
			this.avatar.set_texture(assets.pc_icon);
		}else{
			this.msg_bcg.tint=0xffffff;
			this.update_avatar(msg_data.uid, this.avatar);
		}

		this.uid=msg_data.uid;
		this.tm=msg_data.tm;

		this.name.set2(msg_data.name,150);
		this.name.tint=this.nameToColor(msg_data.name);
		this.msg_tm.text = new Date(msg_data.tm).toLocaleString();
		
		this.visible = true;

		if (msg_data.gif_id){

			const base_t=await gif_sel.load_gif(`${COM_URL}/gifs/${msg_data.gif_id}.mp4`)

			if (!base_t) {
				console.log(`Не получилось загрузить гифку ${msg_data.gif_id}`)
				this.visible=false;
				return 0;
			}

			base_t.resource.source.play()
			base_t.resource.source.loop=true
			
			this.msg.text=''

			this.gif.texture=PIXI.Texture.from(base_t)
			this.gif.visible=true
			const aspect_ratio=base_t.width/base_t.height
			this.gif.height=90
			this.gif.width=this.gif.height*aspect_ratio
			this.msg_bcg.visible=false
			this.msg.visible=false
			this.msg_tm.anchor.set(0,0)
			this.msg_tm.y=this.gif.height+9
			this.msg_tm.x=this.gif.width+102

			this.gif_bcg.visible=true
			this.gif_bcg.height=this.gif.height
			this.gif_bcg.width=	this.gif.width
			return this.gif.height+30

		}else{

			this.gif_bcg.visible=false;
			this.gif.visible=false;
			this.msg_bcg.visible=true;
			this.msg.visible=true;

			this.msg.text=msg_data.msg;
			
			//бэкграунд сообщения в зависимости от длины
			const msg_bcg_width=Math.max(this.msg.width,100)+100;
			this.msg_bcg.width=msg_bcg_width*1.5;

			if (msg_bcg_width>300){
				this.msg_tm.anchor.set(1,0);
				this.msg_tm.y=this.avatar.y+52;
				this.msg_tm.x=msg_bcg_width+55;
			}else{
				this.msg_tm.anchor.set(0,0);
				this.msg_tm.y=this.avatar.y+37;
				this.msg_tm.x=msg_bcg_width+62;
			}

			return 70;
		}
	}

}

class feedback_record_class extends PIXI.Container {

	constructor() {

		super();
		this.text=new PIXI.BitmapText('', {fontName: 'bahnschrift48s',fontSize: 19,align: 'left',lineSpacing:45})
		this.text.maxWidth=290
		this.text.tint=0xFFFF00

		this.name_text=new PIXI.BitmapText('', {fontName: 'bahnschrift48s',fontSize: 19,align: 'left'})
		this.name_text.tint=0xFFFFFF


		this.addChild(this.text,this.name_text)
	}

	set(fb){		
	
		//метка что отзывов нет
		if (fb.nofb){
			this.text.visible=false
			this.name_text.text='Нет отзывов'
			this.name_text.tint=0x558899
			return
		}
		
		let sender_name = fb.name || 'Неизв.'
		if (sender_name.length > 10) sender_name = sender_name.substring(0, 10)
				
		this.text.visible=true
		this.text.text=sender_name+': '+fb.f
		
		this.name_text.tint=0xFFFFFF
		this.name_text.text=sender_name+':'

	}
}

class design_class extends PIXI.Container{

	constructor(){

		super();
		this.shadow=new PIXI.Sprite(assets.bcg_icon_shadow);
		this.shadow.width=170;
		this.shadow.height=100;

		this.bcg=new PIXI.Sprite(assets.design_0);
		this.bcg.width=170;
		this.bcg.height=100;

		this.lock=new PIXI.Sprite(assets.lock);
		this.lock.width=70;
		this.lock.height=70;
		this.lock.anchor.set(0.5,0.5);
		this.lock.x=140;
		this.lock.y=65;
		this.lock.angle=30;
		this.lock.visible=false;

		this.id=0;

		this.interactive=true;
		this.buttonMode=true;
		this.pointerdown=function(){pref.design_down(this)};

		this.addChild(this.bcg,this.lock)

	}

	set_design(id){
		this.id=id;
		this.bcg.texture=assets['design_'+id];
	}

}

class trnm_card_class extends PIXI.Container{

	constructor(){

		super()
		
		this.uid1=0
		this.uid2=0

		this.bcg=new PIXI.Sprite(assets.trnm_card_bcg)
		this.bcg.width=140
		this.bcg.height=80
		this.bcg.interactive=true
		const t=this
		this.bcg.pointerdown=function(){trnm.card_down(t)}

		//аватар первого игрока
		this.avatar1=new PIXI.Graphics();
		this.avatar1.x=20
		this.avatar1.y=20
		this.avatar1.w=this.avatar1.h=30

		//аватар второго игрока
		this.avatar2=new PIXI.Graphics();
		this.avatar2.x=90
		this.avatar2.y=20
		this.avatar2.w=this.avatar2.h=30

		this.t_name1=new PIXI.BitmapText('', {fontName: 'bahnschrift48s',fontSize: 15,align: 'center'});
		this.t_name1.anchor.set(0,0.5);
		this.t_name1.x=15;
		this.t_name1.y=60;
		this.t_name1.tint=0xffffff

		this.t_name2=new PIXI.BitmapText('', {fontName: 'bahnschrift48s',fontSize: 15,align: 'center'});
		this.t_name2.anchor.set(1,0.5);
		this.t_name2.x=125;
		this.t_name2.y=60;
		this.t_name2.tint=0xffffff

		this.t_score=new PIXI.BitmapText('', {fontName: 'bahnschrift48s',fontSize: 18,align: 'center'});
		this.t_score.x=70
		this.t_score.y=20
		this.t_score.anchor.set(0.5,0.5)
		this.t_score.tint=0xffff00

		this.addChild(this.bcg,this.avatar1,this.avatar2,this.t_name1,this.t_name2,this.t_score)

	}
}

class trnm_precard_class extends PIXI.Container{

	constructor(){

		super()

		this.id=0
		this.uid=0

		this.avatar=new PIXI.Graphics()
		this.avatar.w=this.avatar.h=70
		this.avatar.x=10
		this.avatar.y=10

		this.bcg=new PIXI.Sprite(assets.trnm_avatar_bcg2)
		this.bcg.width=90
		this.bcg.height=90

		this.t_name=new PIXI.BitmapText('', {fontName: 'bahnschrift48s',fontSize: 18,align: 'center'});
		this.t_name.x=45
		this.t_name.y=90
		this.t_name.anchor.set(0.5,0.5)

		this.t_rating=new PIXI.BitmapText('', {fontName: 'bahnschrift48s',fontSize: 22,align: 'center'});
		this.t_rating.x=45
		this.t_rating.y=70
		this.t_rating.tint=0xffff00
		this.t_rating.anchor.set(0.5,0.5)

		this.addChild(this.avatar,this.bcg,this.t_name,this.t_rating)
	}

	set(pdata){

		this.avatar.set_texture(pdata.texture)
		this.t_name.set2(pdata.name,90)
		this.t_rating.text=pdata.rating

	}


}

anim3={

	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	empty_spr : {x:0,visible:false,ready:true, alpha:0},

	slots: new Array(50).fill().map(u => ({obj:{},on:0,block:true,params_num:0,p_resolve:0,progress:0,vis_on_end:false,tm:0,params:new Array(10).fill().map(u => ({param:'x',s:0,f:0,d:0,func:this.linear}))})),

	any_on() {

		for (let s of this.slots)
			if (s.on&&s.block)
				return true
		return false;
	},

	wait(seconds){
		return this.add(this.empty_spr,{x:[0,1,'linear']}, false, seconds);
	},

	linear(x) {
		return x
	},

	kill_anim(obj) {

		for (let i=0;i<this.slots.length;i++){
			const slot=this.slots[i];
			if (slot.on&&slot.obj===obj){
				this.finish_slot(slot)
				slot.p_resolve(2)
			}
		}
	},
	
	finish_all_slots(){		
		for (let i=0;i<this.slots.length;i++){
			const slot=this.slots[i];
			if (slot.on){
				this.finish_slot(slot)
				slot.p_resolve(3)
			}
		}
	},

	easeBridge(x){

		if(x<0.1)
			return x*10;
		if(x>0.9)
			return (1-x)*10;
		return 1
	},

	easeOutBack(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},

	easeOutElastic(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},

	easeOutSine(x) {
		return Math.sin( x * Math.PI * 0.5);
	},

	easeOutQuart(x){
		return 1 - Math.pow(1 - x, 4);
	},

	easeOutCubic(x) {
		return 1 - Math.pow(1 - x, 3);
	},

	easeTwiceBlink(x){

		if(x<0.333)
			return 1;
		if(x>0.666)
			return 1;
		return 0
	},

	flick(x){

		return Math.abs(Math.sin(x*6.5*3.141593));

	},

	easeInBack(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},

	easeInQuad(x) {
		return x * x;
	},

	easeOutBounce(x) {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1) {
			return n1 * x * x;
		} else if (x < 2 / d1) {
			return n1 * (x -= 1.5 / d1) * x + 0.75;
		} else if (x < 2.5 / d1) {
			return n1 * (x -= 2.25 / d1) * x + 0.9375;
		} else {
			return n1 * (x -= 2.625 / d1) * x + 0.984375;
		}
	},

	easeInCubic(x) {
		return x * x * x;
	},

	ease3peaks(x){

		if (x < 0.16666) {
			return x / 0.16666;
		} else if (x < 0.33326) {
			return 1-(x - 0.16666) / 0.16666;
		} else if (x < 0.49986) {
			return (x - 0.3326) / 0.16666;
		} else if (x < 0.66646) {
			return 1-(x - 0.49986) / 0.16666;
		} else if (x < 0.83306) {
			return (x - 0.6649) / 0.16666;
		} else if (x >= 0.83306) {
			return 1-(x - 0.83306) / 0.16666;
		}
	},

	ease2back(x) {
		return Math.sin(x*Math.PI);
	},

	easeInOutCubic(x) {

		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},

	easeInOutBack(x) {

		return x < 0.5
		  ? (Math.pow(2 * x, 2) * ((this.c2 + 1) * 2 * x - this.c2)) / 2
		  : (Math.pow(2 * x - 2, 2) * ((this.c2 + 1) * (x * 2 - 2) + this.c2) + 2) / 2;
	},

	shake(x) {

		return Math.sin(x*2 * Math.PI);


	},

	add (obj, inp_params, vis_on_end, time, block) {

		//если уже идет анимация данного спрайта то отменяем ее
		anim3.kill_anim(obj)
		
		if(document.hidden){
			this.finish_obj(obj,inp_params,vis_on_end)
			return
		}
		

		let found=false;
		//ищем свободный слот для анимации
		for (let i = 0; i < this.slots.length; i++) {

			const slot=this.slots[i];
			if (slot.on) continue;

			found=true;

			obj.visible = true
			obj.ready = false

			//заносим базовые параметры слота
			slot.on=1;
			slot.params_num=Object.keys(inp_params).length;
			slot.obj=obj;
			slot.vis_on_end=vis_on_end;
			slot.block=block===undefined;
			slot.t1=TM.s
			slot.t=time

			//добавляем дельту к параметрам и устанавливаем начальное положение
			let ind=0;
			for (const param in inp_params) {

				const s=inp_params[param][0];
				let f=inp_params[param][1];
				const d=f-s;


				//для возвратных функцие конечное значение равно начальному что в конце правильные значения присвоить
				const func_name=inp_params[param][2];
				const func=anim3[func_name].bind(anim3);
				if (func_name === 'ease2back'||func_name==='shake') f=s;

				slot.params[ind].param=param;
				slot.params[ind].s=s;
				slot.params[ind].f=f;
				slot.params[ind].d=d;
				slot.params[ind].func=func;
				ind++;

				//фиксируем начальное значение параметра
				obj[param]=s;
			}

			return new Promise(resolve=>{
				slot.p_resolve = resolve;
			});
		}

		console.log("Кончились слоты анимации");
		this.finish_obj(obj,inp_params,vis_on_end)



	},
	
	finish_obj(obj,params,vis_on_end){
		
		//сразу записываем конечные параметры объекта
		for (const param in params)
			obj[param]=params[param][1]
		obj.ready=true		
		obj.visible=vis_on_end		
		if(!vis_on_end) obj.alpha=1	
	},
	
	finish_slot(slot){
		
		//заносим конечные параметры
		for (let i=0;i<slot.params_num;i++){
			const param=slot.params[i].param;
			const f=slot.params[i].f;
			slot.obj[param]=f;
		}
		
		slot.on = 0
		slot.obj.ready=true
		slot.obj.visible=slot.vis_on_end;
		if(!slot.vis_on_end) slot.obj.alpha=1;
	},

	process () {

		for (let i = 0; i < this.slots.length; i++) {
			const slot=this.slots[i];
			const obj=slot.obj;
			if (slot.on) {

				const progress=(TM.s-slot.t1)/slot.t

				for (let i=0;i<slot.params_num;i++){

					const param_data=slot.params[i]
					const param=param_data.param
					const s=param_data.s
					const d=param_data.d
					const func=param_data.func
					slot.obj[param]=s+d*func(progress)
				}

				//если анимация завершилась то удаляем слот
				if (progress>=0.999) {
					this.finish_slot(slot)
					slot.p_resolve(1)
				}
			}
		}
	}
}

sound={

	on : 1,

	play(res_name, res_src) {

		res_src=res_src||assets;

		if (!this.on||document.hidden)
			return;

		if (!res_src[res_name])
			return;

		res_src[res_name].play();

	},

	switch(){

		if (this.on){
			this.on=0;
			objects.pref_info.text=['Звуки отключены','Sounds is off'][LANG];

		} else{
			this.on=1;
			objects.pref_info.text=['Звуки включены','Sounds is on'][LANG];
		}
		anim3.add(objects.pref_info, {alpha: [0, 1, 'easeBridge']}, false, 3, false);

	}

}

pmsg={

	promise_resolve :0,

	async add({t='text', timeout=3000,snd='message',online=0}={}) {

		if (this.promise_resolve!==0)
			this.promise_resolve("forced")
			
		//воспроизводим звук
		sound.play(snd);

		objects.pmsg_text.text=t
		const anim_res=await anim3.add(objects.pmsg_cont,{x:[-200,objects.pmsg_cont.sx,'easeOutBack']}, true, 0.25);

		if (anim_res===2) return
		
		const res = await new Promise(res => {
			pmsg.promise_resolve = res;
			setTimeout(res, timeout)
		})

		if (res==="forced") return

		anim3.add(objects.pmsg_cont,{x:[objects.pmsg_cont.sx, -200,'easeInBack']}, false, 0.25);
	},
	
	no_in_chat_down(){
		pmsg.promise_resolve()
		mp_game.no_in_chat_cmd()
	},

	clicked() {
		pmsg.promise_resolve()
	}

}

big_msg = {

	p_resolve : 0,

	show(params) {

		objects.big_msg_t1.text=params.t1||''
		objects.big_msg_t2.text=params.t2||''
		objects.big_msg_t3.text=params.t3||''

		objects.big_msg_fb_btn.visible = (!my_data.blocked)&&params.fb&&my_data.games>=200

		anim3.add(objects.big_msg_cont, {y: [-180, objects.big_msg_cont.sy, 'easeOutBack']}, true, 0.6);

		this.show_bonus_anim(objects.big_msg_energy,params.energy||0)
		this.show_bonus_anim(objects.big_msg_crystals,params.crystals||0)

		return new Promise(function(resolve, reject){
			big_msg.p_resolve = resolve;
		});
	},

	show_bonus_anim(text_obj,tar_val){

		if (tar_val===0){
			text_obj.text=0
			return
		}

		const interval_time=(tar_val*52+948)/tar_val

		let lights=0
		const t=setInterval(()=>{
			lights++
			text_obj.text='+'+lights
			if (lights===tar_val)
				clearInterval(t)
		},interval_time)

	},

	async fb_btn_down() {

		if (anim3.any_on()){
			sound.play('locked');
			return;
		}

		sound.play('click');

		anim3.add(objects.big_msg_cont, {y: [objects.big_msg_cont.sy, 450, 'easeInBack']}, false, 0.4);

		//пишем отзыв и отправляем его
		const fb = await keyboard.read();
		if (fb.length>0) {			
			my_ws.safe_send({cmd:'push',path:'fb/'+opp_data.uid,val:{uid:my_data.uid.substring(0,7),name:my_data.name,f:fb,tm:'TMS'}})
		}

		this.close('close');

	},

	ok_btn_down() {

		if (anim3.any_on()){
			sound.play('locked');
			return;
		}

		sound.play('close');
		
		anim3.add(objects.big_msg_close_btn, {alpha:[0.25, 1, 'linear']}, true, 0.5)
		
		this.close('close')
	},
	
	close(reason){		
		anim3.add(objects.big_msg_cont, {y: [objects.big_msg_cont.sy, 450, 'easeInBack']}, false, 0.4);
		this.p_resolve(reason);		
	}

}

brd_func={

	checker_to_move:'',
	target_point:0,
	chips_tex:[0,0,0],
	moves:[],
	base64:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789()',

	move_end_callback(){},
	
	get_def_brd(){
		
		return [
			[2,2,2,2,0,0,0,0],
			[2,2,2,2,0,0,0,0],
			[2,2,2,2,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,1,1,1,1],
			[0,0,0,0,1,1,1,1],
			[0,0,0,0,1,1,1,1]
		]
		
	},

	show_home_area(brd,line_style={width:1.8,alpha:0.65,color:0x55ff99,cap:PIXI.LINE_CAP.ROUND}){

		objects.home_cfg.clear()
		objects.home_cfg.lineStyle(line_style)
		
		for (let y=0;y<8;y++){
			for (let x=1;x<8;x++){
				if (g_board[y][x]!==g_board[y][x-1]){
					objects.home_cfg.moveTo(40+x*50,40+y*50)
					objects.home_cfg.lineTo(40+x*50,40+(y+1)*50)
				}
			}
		}
		for (let x=0;x<8;x++){
			for (let y=1;y<8;y++){			
				if (g_board[y][x]!==g_board[y-1][x]){
					objects.home_cfg.moveTo(40+x*50,40+y*50)
					objects.home_cfg.lineTo(40+(x+1)*50,40+y*50)
				}
			}
		}
		
		
	},
	
	brd_to_Uint8Array(brd){
		
		const b = new Uint8Array(64);
		for (let y=0;y<8;y++)
			for (let x=0;x<8;x++)
				b[y*8+x]=brd[y][x]
		return b
	},
	
	update_board(board) {

		this.target_point=0;

		//сначала скрываем все шашки
		objects.checkers.forEach(c=>{c.visible=false});

		let ind=0;
		for (let x=0;x<8;x++) {
			for (let y=0;y<8;y++) {

				const chip_id=board[y][x];
				if (chip_id){

					objects.checkers[ind].x=x*50+objects.board.x+20;
					objects.checkers[ind].y=y*50+objects.board.y+20;

					objects.checkers[ind].ix=x;
					objects.checkers[ind].iy=y;
					objects.checkers[ind].m_id=chip_id;
					objects.checkers[ind].texture=this.chips_tex[chip_id];
					objects.checkers[ind].alpha=1;

					objects.checkers[ind].visible=true;
					ind++;
				}
			}
		}
	},

	get_checker_by_pos(x,y) {

		for (let c of objects.checkers)
			if (c.ix===x && c.iy===y)
				return c;
		return 0;
	},

	get_moves_path(move_data,board){

		let g_archive=[0,0,0,0,0,0,0,0,0,0,0]
		let move_archive=[[move_data.x1,move_data.y1]]

		function left(move_data,cur_board, m_archive) {

			let new_x=move_data.x1-1;
			let new_y=move_data.y1;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;

			if (cur_board[new_y][new_x]===0)
			{
				if (new_x===move_data.x2 && new_y===move_data.y2) {
					m_archive=null;
					g_archive=[[move_data.x1,move_data.y1],[new_x,new_y]];
				}
				return
			}
			else
			{
				left_combo(move_data,cur_board,	m_archive);
			}
		}

		function right(move_data,cur_board, m_archive) {
			let new_x=move_data.x1+1;
			let new_y=move_data.y1;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0)
				return;

			if (cur_board[new_y][new_x]===0)
			{
				if (new_x===move_data.x2 && new_y===move_data.y2) {
					m_archive=null;
					g_archive=[[move_data.x1,move_data.y1],[new_x,new_y]];
				}
				return
			}
			else
			{
				right_combo(move_data,cur_board, m_archive);
			}
		}

		function up(move_data,cur_board, m_archive){
			let new_x=move_data.x1;
			let new_y=move_data.y1-1;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0)
				return;

			if (cur_board[new_y][new_x]===0)
			{
				if (new_x===move_data.x2 && new_y===move_data.y2) {
					m_archive=null;
					g_archive=[[move_data.x1,move_data.y1],[new_x,new_y]];
				}
				return
			}
			else
			{
				up_combo(move_data,cur_board, m_archive);
			}
		}

		function down(move_data,cur_board, m_archive){
			let new_x=move_data.x1;
			let new_y=move_data.y1+1;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0)
				return;

			if (cur_board[new_y][new_x]===0)
			{
				if (new_x===move_data.x2 && new_y===move_data.y2) {
					m_archive=null;
					g_archive=[[move_data.x1,move_data.y1],[new_x,new_y]];
				}
				return
			}
			else
			{
				down_combo(move_data,cur_board, m_archive);
			}
		}

		function left_combo(move_data, cur_board, m_archive) {

			let new_x=move_data.x1-2;
			let new_y=move_data.y1;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;
			if (cur_board[move_data.y1][move_data.x1-1]===0) return;
			if (cur_board[new_y][new_x]!==0) return;

			cur_board[new_y][new_x]=cur_board[move_data.y1][move_data.x1];

			m_archive.push([new_x,new_y]);
			if (new_x===move_data.x2 && new_y===move_data.y2) {
				//только если мы нашли более коротку последовательность
				if (m_archive.length<=g_archive.length)
					g_archive=m_archive;
				return;
			}

			//в первую часть хода записываем текущую позицию
			let m_data={x1:new_x,y1:new_y,x2:move_data.x2,y2:move_data.y2}

			//продолжаем попытки комбо
			left_combo(		m_data, JSON.parse(JSON.stringify(cur_board)),	JSON.parse(JSON.stringify(m_archive)));
			up_combo(		m_data, JSON.parse(JSON.stringify(cur_board)),	JSON.parse(JSON.stringify(m_archive)));
			down_combo(		m_data, JSON.parse(JSON.stringify(cur_board)),	JSON.parse(JSON.stringify(m_archive)));

		}

		function right_combo(move_data,cur_board, m_archive) {

			let new_x=move_data.x1+2;
			let new_y=move_data.y1;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;
			if (cur_board[move_data.y1][move_data.x1+1]===0) return;
			if (cur_board[new_y][new_x]!==0) return;

			cur_board[new_y][new_x]=cur_board[move_data.y1][move_data.x1];

			m_archive.push([new_x,new_y]);
			if (new_x===move_data.x2 && new_y===move_data.y2) {
				//только если мы нашли более коротку последовательность
				if (m_archive.length<=g_archive.length)
					g_archive=m_archive;
				return;
			}

			//в первую часть хода записываем текущую позицию
			let m_data={x1:new_x,y1:new_y,x2:move_data.x2,y2:move_data.y2}

			right_combo(	m_data, JSON.parse(JSON.stringify(cur_board)),	JSON.parse(JSON.stringify(m_archive)));
			up_combo(		m_data, JSON.parse(JSON.stringify(cur_board)),	JSON.parse(JSON.stringify(m_archive)));
			down_combo(		m_data, JSON.parse(JSON.stringify(cur_board)),	JSON.parse(JSON.stringify(m_archive)));

		}

		function up_combo(move_data,cur_board, m_archive) {

			let new_x=move_data.x1;
			let new_y=move_data.y1-2;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;
			if (cur_board[move_data.y1-1][move_data.x1]===0) return;
			if (cur_board[new_y][new_x]!==0) return;

			cur_board[new_y][new_x]=cur_board[move_data.y1][move_data.x1];

			m_archive.push([new_x,new_y]);
			if (new_x===move_data.x2 && new_y===move_data.y2) {
				//только если мы нашли более коротку последовательность
				if (m_archive.length<=g_archive.length)
					g_archive=m_archive;
				return;
			}

			//в первую часть хода записываем текущую позицию
			let m_data={x1:new_x,y1:new_y,x2:move_data.x2,y2:move_data.y2}

			right_combo(	m_data, JSON.parse(JSON.stringify(cur_board)),	JSON.parse(JSON.stringify(m_archive)));
			up_combo(		m_data, JSON.parse(JSON.stringify(cur_board)),	JSON.parse(JSON.stringify(m_archive)));
			left_combo(		m_data, JSON.parse(JSON.stringify(cur_board)),	JSON.parse(JSON.stringify(m_archive)));

		}

		function down_combo(move_data,cur_board, m_archive) {

			let new_x=move_data.x1;
			let new_y=move_data.y1+2;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;
			if (cur_board[move_data.y1+1][move_data.x1]===0) return;
			if (cur_board[new_y][new_x]!==0) return;

			cur_board[new_y][new_x]=cur_board[move_data.y1][move_data.x1];

			m_archive.push([new_x,new_y]);
			if (new_x===move_data.x2 && new_y===move_data.y2) {
				//только если мы нашли более коротку последовательность
				if (m_archive.length<=g_archive.length)
					g_archive=m_archive;
				return;
			}

			//в первую часть хода записываем текущую позицию
			let m_data={x1:new_x,y1:new_y,x2:move_data.x2,y2:move_data.y2}

			right_combo(	m_data, JSON.parse(JSON.stringify(cur_board)),	JSON.parse(JSON.stringify(m_archive)));
			down_combo(		m_data, JSON.parse(JSON.stringify(cur_board)),	JSON.parse(JSON.stringify(m_archive)));
			left_combo(		m_data, JSON.parse(JSON.stringify(cur_board)),	JSON.parse(JSON.stringify(m_archive)));

		}

		left(	move_data,	JSON.parse(	JSON.stringify(board)),	JSON.parse(JSON.stringify(move_archive)));
		right(	move_data,	JSON.parse(	JSON.stringify(board)),	JSON.parse(JSON.stringify(move_archive)));
		up(		move_data,	JSON.parse(	JSON.stringify(board)),	JSON.parse(JSON.stringify(move_archive)));
		down(	move_data,	JSON.parse(	JSON.stringify(board)),	JSON.parse(JSON.stringify(move_archive)));

		return g_archive;
	},

	async start_gentle_move(move_data, moves, board) {

		moving_chip = this.get_checker_by_pos(move_data.x1, move_data.y1);

		for (let i = 1 ; i < moves.length; i++) {
			const tar_x = moves[i][0] * 50 + objects.board.x+20;
			const tar_y = moves[i][1] * 50 + objects.board.y+20;
			await anim3.add(moving_chip, {x:[moving_chip.x, tar_x,'linear'], y: [moving_chip.y, tar_y, 'linear']}, true, 0.16);
			sound.play('move');
		}

		moving_chip.ready=true;

		const [sx,sy]=moves[0];
		const [tx,ty]=moves[moves.length-1];

		//меняем старую и новую позицию шашки
		[board[ty][tx],board[sy][sx]]=[board[sy][sx],board[ty][tx]];

		//обновляем доску
		this.update_board(board);

	},

	brd_to_str(brd,move){

		//кодируем доску в символы base64
		let b_str=''
		for (let p=1;p<=2;p++)
			for (let y=0;y<8;y++)
				for (let x=0;x<8;x++)
					if (brd[y][x]===p)
						b_str+=this.base64[x+y*8]

		if (move) b_str+=move
		return b_str;
	},
	
	brd_cfg_to_brd(str){
		
		const t_board =[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];

		//декодируем строку в доску
		for (let i=0;i<str.length;i++){
			const ind=this.base64.indexOf(str[i])
			const y=Math.floor(ind/8)
			const x=ind%8;
			t_board[y][x]=1
			t_board[7-y][7-x]=2
		}
		return t_board
		
	},

	str_to_brd(str){

		const t_board =[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];

		//декодируем строку в доску
		for (let i=0;i<24;i++){
			const ind=this.base64.indexOf(str[i]);
			const y=Math.floor(ind/8);
			const x=ind%8;
			t_board[y][x]=1+(i>=12);
		}
		return t_board;
	},

	rotate_board(brd){
		if (!brd) return;
		const new_board=JSON.parse(JSON.stringify(brd));
		for (x=0;x<8;x++){
			for(y=0;y<8;y++){
				let figure=new_board[7-y][7-x];
				if(figure!==0) figure=3-figure;
				brd[y][x]=figure;
			}
		}
	},

	count_finished1(brdU) {
		let cnt=0;
		for (let y=0;y<3;y++)
			for (let x=0;x<4;x++)
				if (brd[y*8+x]===1)
					cnt++;
		return cnt;
	},

	count_finished2(brdU) {
		let cnt=0;
		for (let y=5;y<8;y++)
			for (let x=4;x<8;x++)
				if (brdU[y*8+x]===2)
					cnt++;
		return cnt;
	},

	finished1(brdU) {
		for (let y=0;y<3;y++)
			for (let x=0;x<4;x++)
				if (brdU[y*8+x]!==1)
					return 0;
		return 1;
	},

	finished2(brdU) {
		for (let y=5;y<8;y++)
			for (let x=4;x<8;x++)
				if (brdU[y*8+x]!==2)
					return 0;
		return 1;
	},

	any1home(brdU) {
		for (let y=5;y<8;y++)
			for (let x=4;x<8;x++)
				if (brdU[y*8+x]===1)
					return 1;
		return 0;
	},

	any2home(brdU) {
		for (let y=0;y<3;y++)
			for (let x=0;x<4;x++)
				if (brdU[y*8+x]===2)
					return 1;
		return 0;
	},

	get_brd_state(board, made_moves) {

		let w1=this.finished1(board);
		let w2=this.finished2(board);
		if (w1 === 1 && w2 === 1)
			return 'both_finished'
		if (w1 === 1)
			return 'my_finished_first'
		if (w2 === 1)
			return 'opp_finished_first'

		let any1home30 = this.any1home(board)*(made_moves >= 30);
		let any2home30 = this.any2home(board)*(made_moves >= 30);

		if (any1home30 === 1 && any2home30 === 1)
			return 'both_left_after_30'
		if (any1home30 === 1)
			return 'my_left_after_30'
		if (any2home30 === 1)
			return 'opp_left_after_30'


		//это случай если игра дошла до 80 хода
		if (made_moves >= 80) {

			let fin1=this.count_finished1(board);
			let fin2=this.count_finished2(board);

			if (fin1	>	fin2)	return 'my_more_fin_after_80';
			if (fin1	<	fin2)	return 'opp_more_fin_after_80';
			if (fin1	===	fin2)	return 'same_fin_after_80';
		}

		return '';
	}
}

brd_func2={
	
	boards_cfg:[
	   [[2,2,2,2,0,0,0,0],
		[2,2,2,2,0,0,0,0],
		[2,2,2,2,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,1,1,1,1],
		[0,0,0,0,1,1,1,1],
		[0,0,0,0,1,1,1,1]],
	   [[2,2,2,0,0,0,0,0],
		[2,2,2,0,0,0,0,0],
		[2,2,2,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,1,1,1],
		[0,0,0,0,0,1,1,1],
		[0,0,0,0,0,1,1,1]],
	   [[1,1,1,1,0,0,0,0],
		[1,1,1,0,0,0,0,0],
		[1,1,0,0,0,0,0,0],
		[1,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,1],
		[0,0,0,0,0,0,1,1],
		[0,0,0,0,0,1,1,1],
		[0,0,0,0,1,1,1,1]]
	],
	
	init_brd_cfg:[],
	
	set_brd_cfg(id){		
		this.init_brd_cfg=this.boards_cfg[id]
	},
	
	get_start_brd(){		
		return JSON.parse(JSON.stringify(this.init_brd_cfg))
	},
	
	count_finished1(brd) {
		let cnt=0;
		for (let y=0;y<8;y++)
			for (let x=0;x<8;x++)
				if (this.init_brd_cfg[y][x]===2&&brd[y][x]===1)
					cnt++;
		return cnt;
	},

	count_finished2(brd) {
		let cnt=0;
		for (let y=0;y<8;y++)
			for (let x=0;x<8;x++)
				if (this.init_brd_cfg[y][x]===1&&brd[y][x]===2)
					cnt++;
		return cnt;
	},

	finished1(brd) {
		for (let y=0;y<8;y++)
			for (let x=0;x<8;x++)
				if (this.init_brd_cfg[y][x]===2&&brd[y][x]!==1)
					return 0
		return 1
	},

	finished2(brd) {
		for (let y=0;y<8;y++)
			for (let x=0;x<8;x++)
				if (this.init_brd_cfg[y][x]===1&&brd[y][x]!==2)
					return 0
		return 1
	},

	any1home(brd) {
		for (let y=0;y<8;y++)
			for (let x=0;x<8;x++)
				if (this.init_brd_cfg[y][x]===1&&brd[y][x]===1)
					return 1
		return 0
	},

	any2home(brd) {
		for (let y=0;y<8;y++)
			for (let x=0;x<8;x++)
				if (this.init_brd_cfg[y][x]===2&&brd[y][x]===2)
					return 1
		return 0
	},
	
	get_brd_state(brd, made_moves) {

		const w1=this.finished1(brd);
		const w2=this.finished2(brd);
		if (w1===1 && w2===1) return 'both_finished'
		if (w1===1) return 'my_finished_first'
		if (w2===1) return 'opp_finished_first'

		const any1home30 = this.any1home(brd)*(made_moves >= 30);
		const any2home30 = this.any2home(brd)*(made_moves >= 30);

		if (any1home30 === 1 && any2home30 === 1) return 'both_left_after_30'
		if (any1home30 === 1) return 'my_left_after_30'
		if (any2home30 === 1) return 'opp_left_after_30'

		//это случай если игра дошла до 80 хода
		if (made_moves >= 80) {
			
			const fin1=this.count_finished1(brd)
			const fin2=this.count_finished2(brd)

			if (fin1>fin2) return 'my_more_fin_after_80'
			if (fin1<fin2) return 'opp_more_fin_after_80'
			if (fin1===fin2) return 'same_fin_after_80'
		}

		return '';
	}
	
}

online_game = {

	on:0,
	start_time : 0,
	disconnect_time : 0,
	me_conf_play : 0,
	opp_conf_play : 0,
	time_for_move:0,
	timer_id : 0,
	prv_tick_time:0,
	chat_incoming:1,
	chat_active:1,
	NO_RATING_GAME:0,
	no_rating_msg_timer:0,
	last_opps:[],
	unique_opps:[],
	my_moves_hist:[],
	opp_moves_hist:[],
	energy_collected:0,
	trnm:0,
	gid:0,
	
	calc_new_rating(old_rating, game_result) {

		if (game_result === NOSYNC)	return old_rating;

		const Ea = 1 / (1 + Math.pow(10, ((opp_data.rating-my_data.rating)/400)));
		const Sa = (game_result + 1) / 2;
		return Math.round(my_data.rating + 16 * (Sa - Ea));

	},

	activate(params) {

		this.on=1

		this.my_moves_hist=[]
		this.opp_moves_hist=[]
		my_log.log_arr=[]
		
		//фиксируем номер игры
		this.gid=params.gid

		//пока еще никто не подтвердил игру (кроме случая турнира)
		this.me_conf_play = params.t||0
		this.opp_conf_play = params.t||0

		//турнирная игра
		this.trnm=params.t

		//счетчик времени
		this.prv_tick_time=Date.now()
		this.timer_start_time=Date.now()
		this.time_for_move = 15
		this.timer_id = setTimeout(function(){online_game.timer_tick()}, 1000)
		objects.timer_text.tint=0xffffff

		//отображаем таймер
		objects.timer_cont.visible = true
		objects.game_buttons_cont.visible = true
		objects.timer_cont.x = my_turn === 1 ? 30 : 630

		//фиксируем врему начала игры
		this.start_time = Date.now()

		//сколько игрок играл с этим соперником
		const prv_plays=this.count_in_arr(this.last_opps,opp_data.uid)
		this.NO_RATING_GAME=(!this.blind_game_flag&&this.prv_plays>6&&my_data.rating>MAX_NO_REP_RATING)?1:0
		if (this.NO_RATING_GAME)
			this.no_rating_msg_timer=setTimeout(()=>{pmsg.add({t:'Выбирайте разных соперников для получения и подтверждения рейтинга'})},5000)

		//обновляем стол
		if (params.role==='slave'){
			fbs.ref('tables/'+this.gid+'/master').set(opp_data.uid)			
			fbs.ref('tables/'+this.gid+'/slave').set(my_data.uid)			
		}

		//вычиcляем рейтинг при проигрыше и устанавливаем его в базу он потом изменится
		const lose_rating = this.calc_new_rating(my_data.rating, LOSE)
		if (lose_rating >100 && lose_rating<9999)
			fbs.ref('players/'+my_data.uid+'/rating').set(lose_rating)

		//возможность чата
		this.chat_out=1
		this.chat_in=1
		objects.no_chat_button.alpha=1
		objects.send_message_button.alpha=my_data.blocked?0.3:1

		//устанавливаем локальный и удаленный статус
		set_state({state:'p'})
		
		game.state='online'

		//устанавливаем начальное расположение шашек
		brd_func2.set_brd_cfg(params.brd_cfg||0)
		g_board=brd_func2.get_start_brd()
		brd_func.update_board(g_board)


	},

	add_bonuses(bonuses){

		for (let i=0; i<bonuses.length;i++){

			const c=bonuses[i]
			const index=brd_func.base64.indexOf(c)
			let x = index%8
			let y = Math.floor(index / 8)

			if (my_role==='slave'){
				x=7-x
				y=7-y
			}

			//показываем точки взятия
			const b=objects.bonuses[i]
			b.x=x*50+objects.board.x+55
			b.y=y*50+objects.board.y+55
			b.visible=true
			b.angle=0
			b.alpha=1
			b.width=50
			b.height=50
			b.ix=x
			b.iy=y
			b.taken=0
			b.type='start'
			b.texture=assets.bonus_star

		}

	},

	read_last_opps(){
		
		//последние соперники
		this.last_opps=safe_ls(game_name+'_lo') || []
				
		//уникальные соперники
		this.unique_opps=safe_ls(game_name+'_uo') || []

	},

	update_last_opps(opp_id){

		//уникальные соперники
		if (!this.unique_opps.includes(opp_id)){
			this.unique_opps.push(opp_id)
			if (this.unique_opps.length > 35)
				this.unique_opps = this.unique_opps.slice(-35)
			safe_ls(game_name+'_uo', this.unique_opps)
		}

		//просто последние соперники
		this.last_opps.push(opp_id);
		if (this.last_opps.length > 20)
			this.last_opps = this.last_opps.slice(-20)
		safe_ls(game_name+'_lo', this.last_opps)

	},

	timer_tick() {

		const cur_time=Date.now();
		if ((cur_time-this.prv_tick_time)>5000||cur_time<this.prv_tick_time){
			game.stop('timer_error');
			return;
		}
		this.prv_tick_time=Date.now();

		const time_passed=~~((Date.now()-this.timer_start_time)*0.001);
		const move_time_left=this.time_for_move-time_passed;


		if (move_time_left < 0 && my_turn === 1)	{

			if (this.me_conf_play === 1)
				game.stop('my_timeout');
			else
				game.stop('my_no_sync');

			return;
		}

		if (move_time_left < -5 && my_turn === 0) {

			if (this.opp_conf_play === 1)
				game.stop('opp_timeout');
			else
				game.stop('opp_no_sync');
			return;
		}

		if (connected === 0 && my_turn === 0) {
			this.disconnect_time ++;
			if (this.disconnect_time > 5) {
				game.stop('my_no_connection');
				return;
			}
		}

		//подсвечиваем красным если осталость мало времени
		if (move_time_left === 5) {
			objects.timer_text.tint=0xff0000;
			sound.play('clock');
		}

		//обновляем текст на экране
		objects.timer_text.text='0:'+move_time_left;
		//следующая секунда
		this.timer_id = setTimeout(function(){online_game.timer_tick()}, 1000);
	},

	async send_message() {

		if (!this.chat_out){
			sound.play('locked');
			return;
		}

		if (my_data.blocked){
			pmsg.add({t:'Вы не можете писать в чат, так как вы находитесь в черном списке'});
			sound.play('locked');
			return;
		}

		if (my_data.games<200){
			pmsg.add({t:'Чтобы писать в чат нужно сыграть 200 онлайн игр'});
			sound.play('locked');
			return;
		}


		sound.play('click');
		const msg=await keyboard.read();

		if (msg) fbs.ref('inbox/'+opp_data.uid).set({sender:my_data.uid,message:'CHAT',tm:Date.now(),data:msg});
	},

	async draw_down(){

		if (anim3.any_on()||objects.confirm_cont.visible){
			sound.play('locked');
			return
		}


		if (made_moves <5 ) {
			pmsg.add({t:['Нельзя предлагать ничью в начале игры','Can not draw in beginning'][LANG]});
			return;
		}

		const res = await confirm_dialog.show(['Предложить ничью?','Offer a draw?'][LANG]);
		if (res === 'yes') {
			//отправляем предложение о ничье
			fbs.ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"DRAWREQ",tm:Date.now()});
		}

	},

	async draw_request(){

		const res=await confirm_dialog.show(['Согласны на ничью?','Agree to a draw?'][LANG]);

		if(res==='yes'){
			fbs.ref('inbox/'+opp_data.uid).set({sender:my_data.uid,message:'DRAWOK',tm:Date.now()});
			game.stop('draw');
		}
		if(res==='no')
			fbs.ref('inbox/'+opp_data.uid).set({sender:my_data.uid,message:'DRAWNO',tm:Date.now()});

	},

	reset_timer() {

		//обовляем время разъединения
		this.disconnect_time = 0;

		//перезапускаем таймер хода
		this.timer_start_time=Date.now();
		this.time_for_move = 37;

		objects.timer_text.text='0:'+this.time_for_move;
		objects.timer_text.tint=0xffffff;

		objects.timer_cont.x = my_turn === 1 ? 30 : 630;

	},

	disable_chat(){
		if (!this.chat_in) return;
		this.chat_in=0;
		objects.no_chat_button.alpha=0.3;
		fbs.ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:'NOCHAT',tm:Date.now()});
		pmsg.add({t:['Вы отключили чат','Chat disabled'][LANG]});
	},

	chat(data) {
		if (!this.chat_in) return;
		pmsg.add({t:data,timeout:10000,snd:'online_message'});

		my_log.add({name:my_data.name,opp_name:opp_data.name,game_id,connected,tm:Date.now(),info:'in_chat',chat:data})
	},

	nochat(){

		this.chat_out=0;
		objects.send_message_button.alpha=0.3;
		pmsg.add({t:['Соперник отключил чат','Chat disabled'][LANG]});
	},

	process_my_move(move_data, moves){

		if(!this.on) return;

		//проверяем бонусы
		this.check_bonuses(moves,'my_move')

		//переворачиваем данные о ходе так как оппоненту они должны попасть как ход шашками №2
		move_data.x1=7-move_data.x1;
		move_data.y1=7-move_data.y1;
		move_data.x2=7-move_data.x2;
		move_data.y2=7-move_data.y2;

		//сохраняем историю ходов
		this.my_moves_hist.push(Object.values(move_data).join(''));

		const move_data_short=move_data.x1.toString()+move_data.y1.toString()+move_data.x2.toString()+move_data.y2.toString();

		//новая версия
		const t=((Date.now()-this.start_time||2323)*0.001).toFixed(1);
		fbs.ref('inbox/'+opp_data.uid).set({s:my_data.uid.substring(0,8),m:'M',t,d:move_data_short});

		//также фиксируем данные стола
		const moves_made=my_role==='slave'?made_moves+1:0;
		fbs.ref('tables/'+this.gid+'/board').set({uid:my_data.uid,f_str:brd_func.brd_to_str(g_board,moves_made),tm:firebase.database.ServerValue.TIMESTAMP});

	},

	process_incoming_move(move_data, moves){

		if(!this.on) return
		this.opp_moves_hist.push(Object.values(move_data).join(''))
		this.check_bonuses(moves,'opp_move')

	},

	check_bonuses(moves,whos_move){

		//проверяем бонусы
		for (let i=0;i<objects.bonuses.length;i++){
			const bonus=objects.bonuses[i]
			if (!bonus.visible) continue
			const intersect=moves.find(m=>{
				return m[0]===bonus.ix&&m[1]===bonus.iy
			})
			if (intersect){
				sound.play('bonus')
				if (whos_move==='my_move') this.energy_collected+=10
				const tar_x=whos_move==='my_move'?-80:560
				anim3.add(bonus,{scale_xy:[0.6666,2,'linear'],angle:[0,40,'linear'],alpha:[1,0,'linear'],x:[bonus.x,tar_x,'linear'],y:[bonus.y,70,'linear']}, false, 0.5,false);
			}
		}

	},

	validate_move(m_data){

		if (!this.on||my_role==='master') return 1;

		const my_moves_tot=this.my_moves_hist.length;

		if (my_moves_tot!==10) return 1;

		//переворачиваем данные о ходе
		const move=[7-m_data.x1,7-m_data.y1,7-m_data.x2,7-m_data.y2].join('');


		for (let i=0;i<my_moves_tot;i++){
			const opp_move=this.opp_moves_hist[i];
			const my_move=this.my_moves_hist[i];
			if (opp_move!==my_move)
				return 1;
		}

		if (this.opp_moves_hist[my_moves_tot]!==move)
			return 1;

		return 0
	},

	count_in_arr(arr,elem){

		let count = 0;
		for (let i = 0; i < arr.length; i++)
			if (arr[i] === elem) count++;
		return count;

	},

	async stop(result) {

		this.on=0
		let crystals=0

		const res_array = [
			['my_timeout',LOSE, ['Вы проиграли!\nУ вас закончилось время','You lose!\nOut of time!']],
			['opp_timeout',WIN , ['Вы выиграли!\nУ соперника закончилось время','You win!\nOpponent out of time']],
			['my_giveup' ,LOSE, ['Вы сдались!','You have given up!']],
			['timer_error' ,LOSE, ['Ошибка таймера!','Timer error!']],
			['opp_giveup' ,WIN , ['Вы выиграли!\nСоперник сдался','You win!\nYour opponent has given up!']],
			['both_finished',DRAW, ['Ничья','Draw!']],
			['draw',DRAW, ['Ничья','Draw!']],
			['my_finished_first',WIN , ['Вы выиграли!\nБыстрее соперника перевели свои шашки.','You win!\nYou finished faster than your opponent.']],
			['opp_finished_first',LOSE, ['Вы проиграли!\nСоперник оказался быстрее вас.','You lose!\nOpponent was faster than you']],
			['both_left_after_30',DRAW, ['Ничья\nНикто не успел вывести все шашки из дома.','Draw!\nNo one managed to get out of the house']],
			['my_left_after_30',LOSE, ['Вы проиграли!\nНе успели вывести свои шашки за 30 ходов.','You lose!\nYou did not managed to leave house in 30 moves']],
			['opp_left_after_30',WIN , ['Вы выиграли!\nСоперник не успел вывести свои шашки за 30 ходов.','You win!\nOpponent did not managed to leave house in 30 moves']],
			['my_more_fin_after_80',WIN , ['Вы выиграли!\nПеревели больше шашек в новый дом.','You win!You have transferred more checkers to a new house.']],
			['opp_more_fin_after_80',LOSE, ['Вы проиграли!\nСоперник перевел больше шашек в новый дом.','You lose!\nOpponent transferred more checkers to a new house']],
			['same_fin_after_80',DRAW , ['Ничья\nОдинаковое количество шашек в новом доме','Draw!\nThe same number of transferred checkers']],
			['my_no_sync',NOSYNC , ['Похоже вы не захотели начинать игру.','It looks like you did not want to start the game']],
			['opp_no_sync',NOSYNC , ['Похоже соперник не смог начать игру.','It looks like the opponent could not start the game']],
			['my_no_connection',LOSE , ['Потеряна связь!\nИспользуйте надежное интернет соединение.','Lost connection!\nUse a reliable internet connection']],
			['my_stop',DRAW , ['Вы отменили игру.','You canceled the game']]
		];

		clearTimeout(this.timer_id);
		clearTimeout(this.no_rating_msg_timer);

		const result_row = res_array.find(p => p[0] === result);
		const result_number = result_row[1];
		const result_info = result_row[2][LANG]

		//определяем новый рейтинг и сообщения
		let auth_msg='';
		const old_rating = my_data.rating;
		my_data.rating = this.calc_new_rating(my_data.rating, result_number);
		let NO_AUTH_NO_RATING=0;
		if (my_data.rating>MAX_NO_AUTH_RATING&&!my_data.auth_mode){
			my_data.rating=MAX_NO_AUTH_RATING;
			NO_AUTH_NO_RATING=1;
			auth_msg=`Рейтинг более ${MAX_NO_AUTH_RATING} не доступен игрокам без авторизации(((`;
		}
		if (this.NO_RATING_GAME) {
			my_data.rating=old_rating;
			auth_msg='Выбирайте разных соперников для получения рейтинга';
		}

		//максимальный рейтинг как наказание
		if (my_data.max_rating&&my_data.rating>my_data.max_rating)
			my_data.rating=my_data.max_rating

		//записываем рейтинг в базу
		fbs.ref('players/'+my_data.uid+'/rating').set(my_data.rating);

		//обновляем даные на карточке
		objects.my_card_rating.text=my_data.rating;

		//если диалоги еще открыты
		if (objects.stickers_cont.visible)
			stickers.hide_panel();

		//убираем элементы
		objects.timer_cont.visible = false;
		objects.game_buttons_cont.visible = false;

		//отключаем взаимодейтсвие с доской
		objects.board.pointerdown = function() {};

		//воспроизводим звук
		if (result_number === DRAW || result_number === LOSE || result_number === NOSYNC )
			sound.play('lose');
		else
			sound.play('win');
		
		//если это турнир
		if (this.trnm)
			trnm.process_game_end(result_number)

		//также фиксируем данные стола
		setTimeout(()=>{fbs.ref('tables/'+this.gid+'/board').set({uid:my_data.uid,fin:result,tm:firebase.database.ServerValue.TIMESTAMP})},400)

		//если игра результативна то записываем дополнительные данные
		if (result_number === DRAW || result_number === LOSE || result_number === WIN) {

			//записываем инфу о последних играх в LC
			this.update_last_opps(opp_data.uid)

			//увеличиваем количество игр
			my_data.games++;
			fbs.ref('players/'+my_data.uid+'/games').set(my_data.games);

			//контрольные концовки логируем на виртуальной машине
			if (my_data.rating>1800 || opp_data.rating>1800){
				const duration = Math.floor((Date.now() - this.start_time)*0.001);
				const data={uid:my_data.uid,p1:objects.my_card_name.text,p2:objects.opp_card_name.text,res:result_number,f:result,d:duration,games:my_data.games,r:[old_rating,my_data.rating],g:game_id,cid:client_id,tm:'TMS'}
				my_ws.safe_send({cmd:'log',logger:'corners_games',data});
			}

		}
		
		pref.change_energy(this.energy_collected)
		pref.change_crystals(crystals)
				
		//сообщение об изменении рейтинга
		
		if (this.trnm)
			await big_msg.show({t1:result_info,t2:`${['Рейтинг: ','Rating: '][LANG]} ${old_rating} > ${my_data.rating}`,t3:'вертитесь в меню турнира для продолжения.',energy:this.energy_collected,crystals})
		else
			await big_msg.show({t1:result_info,t2:`${['Рейтинг: ','Rating: '][LANG]} ${old_rating} > ${my_data.rating}`,fb:1,t3:auth_msg,energy:this.energy_collected,crystals})

	},

	clear() {


	}

}

bot_game = {

	on:0,
	me_conf_play : 0,
	opp_conf_play : 0,
	
	activate() {

		this.on=1;

		//устанавливаем локальный и удаленный статус
		set_state ({state : 'b'});

		//очереди
		my_turn=1;

		//таймер уже не нужен
		objects.timer_cont.visible = false;
		objects.game_buttons_cont.visible = false;
		objects.stop_bot_button.visible = true;

		//инициируем доску в зависимости от рейтинга
		if (my_data.rating>=0 && my_data.rating<1500 )
			g_board = [[2,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1]];
		if (my_data.rating>=1500 && my_data.rating<1600 )
			g_board = [[2,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[2,2,0,2,0,0,0,0],[0,0,2,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1]];
		if (my_data.rating>=1600 && my_data.rating<1700 )
			g_board = [[2,2,2,0,0,0,0,0],[2,2,2,2,0,0,0,0],[2,2,2,0,0,0,0,0],[0,2,0,2,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1]];
		if (my_data.rating>=1700 && my_data.rating<1800 )
			g_board = [[0,0,2,2,0,0,0,0],[0,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[2,2,2,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1]];
		if (my_data.rating>=1800)
			g_board = [[0,0,2,2,0,0,0,0],[0,0,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1]];
		if (my_data.rating>=1900)
			g_board = [[0,0,0,2,0,0,0,0],[0,0,2,2,2,0,0,0],[0,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[0,2,0,0,0,0,0,0],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1]];
		if (my_data.rating>=2000)
			g_board = [[0,0,0,0,0,0,0,0],[0,0,0,0,2,2,0,0],[0,0,2,2,2,2,0,0],[0,0,2,2,0,0,0,0],[0,2,2,0,0,0,0,0],[0,2,2,0,1,1,1,1],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1]];

		game.state='bot'
		
		//brd_func_src=brd_func
		brd_func2.set_brd_cfg(0)
		brd_func.update_board(g_board);

	},

	async stop(result) {

		this.on=0

		const res_array = [
			['both_finished',DRAW, ['Ничья','Draw']],
			['my_finished_first',WIN , ['Вы выиграли!\nБыстрее соперника перевели свои шашки.','You win!\nYou finished faster than your opponent.']],
			['opp_finished_first',LOSE, ['Вы проиграли!\nСоперник оказался быстрее вас.','You lose!\nOpponent was faster than you']],
			['both_left_after_30',LOSE, ['Вы проиграли!\nНе успели вывести свои шашки за 30 ходов.','You lose!\nYou did not managed to leave house in 30 moves']],
			['my_left_after_30',LOSE, ['Вы проиграли!\nНе успели вывести свои шашки за 30 ходов.','You lose!\nYou did not managed to leave house in 30 moves']],
			['my_more_fin_after_80',WIN , ['Вы выиграли!\nПеревели больше шашек в новый дом.','You win!You have transferred more checkers to a new house.']],
			['opp_more_fin_after_80',LOSE, ['Вы проиграли!\nСоперник перевел больше шашек в новый дом.','You lose!\nOpponent transferred more checkers to a new house']],
			['same_fin_after_80',DRAW , ['Ничья\nОдинаковое количество шашек в новом доме','Draw!\nThe same number of transferred checkers']],
			['my_stop',DRAW , ['Вы отменили игру.','You canceled the game']]
		];

		let result_number = res_array.find( p => p[0] === result)[1];
		let result_info = res_array.find( p => p[0] === result)[2][LANG];

		//выключаем элементы
		objects.stop_bot_button.visible = false

		//отключаем взаимодейтсвие с доской
		objects.board.pointerdown = function() {}

		//воспроизводим звук
		if (result_number === DRAW || result_number === LOSE)
			sound.play('lose');
		else
			sound.play('win');

		await big_msg.show({t1:result_info, t2:')))',t3:'',fb:1})

	},

	async make_move() {

		if(!this.on) return;

		await new Promise(r=>setTimeout(r,150))

		let m_data={};
		const brdUINT=brd_func.brd_to_Uint8Array(g_board)
		
		if (made_moves < 30)
			m_data=minimax_solver.minimax_3(brdUINT, made_moves)
		else
			m_data=minimax_solver.minimax_3_single(brdUINT, made_moves)
		
		await new Promise(r=>setTimeout(r,150))
		game.receive_move2(m_data)

	},

	reset_timer() {


	},

	clear() {

		this.on=0;
		//выключаем элементы
		objects.stop_bot_button.visible = false;

	}

}

trnm={

	TRNM_CONF:0,
	rounds_cards:[],
	state:'',
	players_data_received:0,
	listeners:{players:0,state:0},
	cached_trnm_data:{tables:{},players:[]},
	reg_process_on:0,
	sec_to_start:0,
	sec_to_start_timer:0,	
	winner_uid:0,
	info3_close_timer:0,
	rules_shown:0,

	send_info3(t){
	
		clearTimeout(this.info3_close_timer)
		objects.trnm_info3.text=t
		anim3.add(objects.trnm_info3_cont,{y:[450, objects.trnm_info3_cont.sy,'linear']}, true, 0.25);
		
		this.info3_close_timer=setTimeout(()=>{
			anim3.add(objects.trnm_info3_cont,{y:[objects.trnm_info3_cont.y, 450,'linear']}, false, 0.25);
		},6000)
		
	},
	
	async check_winner_bonus(){
		
		const winner_data=await fbs_once('trnm/winner/'+my_data.uid)
		if(!winner_data) return
		
		if (winner_data.rating_bonus){
			my_data.rating+=30
			await fbs.ref('trnm/winner/'+my_data.uid+'/rating_bonus').remove()
			await fbs.ref('players/'+my_data.uid+'/rating').set(my_data.rating)
			this.show_winner_bonuses()
		}	
		
		my_data.trnm_winner=1
		
	},
	
	show_winner_bonuses(){
		
		objects.trnm_bonus_cont.visible=true
		anim3.add(objects.trnm_bonus_bcg,{alpha:[0,1,'linear'],scale_xy:[0.666,0.7,'ease2back']}, true, 0.25);
		
	},
	
	async bonus_close_down(){
		
		//если какая-то анимация или открыт диалог
		if (!objects.trnm_bonus_bcg.ready) {
			sound.play('locked');
			return
		};
		
		await anim3.add(objects.trnm_bonus_bcg,{alpha:[1,0,'linear'],scale_xy:[0.666,0.2,'easeInCubic']}, false, 0.25);
		await anim3.add(objects.trnm_bonus_cont,{alpha:[1,0,'linear']}, false, 0.25);

		
	},
	
	async activate(){
		
		
		if (!this.rules_shown){
			anim3.add(objects.trnm_rules_cont,{alpha:[0,1,'linear']}, true, 0.3);			
			this.rules_shown=1
		}


		this.on=1
		anim3.add(objects.trnm_cont, {alpha: [0, 1, 'linear']}, true, 0.25)

		objects.trnm_precards.forEach(c=>c.visible=false)
		objects.trnm_cards.forEach(c=>c.visible=false)
		
		objects.trnm_reg_btn.visible=false
		
		objects.trnm_info1.text='Загрузка данных...'
		objects.trnm_info2.text='...'
		
		//заносим в кэш столы
		this.cached_trnm_data.tables=await fbs_once("trnm/tables")
		
		//обновляем игроков
		await new Promise(res=>{
			fbs.ref("trnm/players").on('value', s => {
				this.cached_trnm_data.players=s.val()
				this.players_updated(s.val())
				res()
			})
		})

		fbs.ref('trnm/state_data').on('value', s => {
			this.state_changed(s.val())
		})
		
		fbs.ref('trnm/tables').on('child_changed', s => {
			console.log('table_changed: ',s.key,s.val())
			this.cached_trnm_data.tables[s.key]=s.val()
			this.tables_updated({[s.key]:s.val()})
		})

	},

	players_updated(d){
			

		if(this.state!=='reg') return
		
		objects.trnm_precards.forEach(c=>c.visible=false)

		if(!d) return
		this.cached_trnm_data.players=d
		console.log('players_updated:', d)
		
		const num_of_players=this.cached_trnm_data.players.filter(p=>p!==undefined).length
		sound.play('trnm_event')
		
		let rows=[]
		let start_y=0
		if (num_of_players>5){
			const row1=Math.floor(num_of_players*0.5)
			rows=[row1,num_of_players-row1]
			start_y=120
		}else{
			rows=[num_of_players]
			start_y=190
		}
		
		let i=0		
		for (let r=0;r<rows.length;r++){
			
			const icons_in_row=rows[r];
			const start_x=(M_WIDTH-icons_in_row*90)*0.5
			
			for (let i2=0;i2<icons_in_row;i2++){
				
				const player=this.cached_trnm_data.players[i]
				if (!player) continue
				
				const precard=objects.trnm_precards[i]
				precard.visible=true
				precard.x=start_x+i2*90
				precard.y=start_y+r*110
				precard.uid=player.uid

				const pdata=players_cache.get_pdata(player.uid)
				if (pdata)
					precard.set(pdata)
				else
					players_cache.update(player.uid)
				i++
			}		
		}
	},

	apply(){



	},
		
	async state_changed(state_data){
		
		const state=state_data.state		
		this.state=state
		this.winner_uid=0
		sound.play('trnm_event')

		if (state==='reg'){
			objects.trnm_reg_btn.visible=true
			objects.trnm_info1.text='Идет регистрация участников...'
			objects.trnm_info2.text='...'
			objects.bcg.texture=assets.bcg
			this.reg_btn_set_state(0)
			objects.trnm_cards.forEach(c=>c.visible=false)
			this.players_updated(this.cached_trnm_data.players)
			this.start_reg_process()
			some_process.trnm_reg=()=>{objects.trnm_info1.alpha=Math.abs(Math.sin(TM.s))}
		}

		if (state==='reg_fin'){
			objects.trnm_reg_btn.visible=false
			objects.trnm_info1.text='Регистрация окончена!'
			objects.trnm_info2.text='турнир начнется через 15 секунд...'
			objects.bcg.texture=assets.bcg
			this.stop_reg_process()
			objects.trnm_cards.forEach(c=>c.visible=false)
			this.cached_trnm_data.players||=await fbs_once('trnm/players')
			some_process.trnm_reg=()=>{objects.trnm_info1.alpha=Math.abs(Math.sin(TM.s*2))}
		}

		if (state==='noplayers'){
			objects.trnm_reg_btn.visible=false
			objects.trnm_info1.text='Турнир не состоялся из-за недостаточного количества игроков!'
			objects.trnm_info2.text='((('
			objects.bcg.texture=assets.bcg
			this.stop_reg_process()
			objects.trnm_precards.forEach(c=>c.visible=false)
			objects.trnm_info1.alpha=1
			some_process.trnm_reg=()=>{}
		}

		if (state==='finished'){
			objects.trnm_reg_btn.visible=false
			objects.trnm_info1.text='Турнир окончен!'
			
			this.winner_uid=this.cached_trnm_data.players[state_data.winner].uid
			
			if (players_cache[this.winner_uid]){
				const winner_name=players_cache[this.winner_uid].name
				objects.trnm_info2.text=`Победитель: ${winner_name}`
			}else{
				players_cache.update(this.winner_uid)
			}				
			
			objects.bcg.texture=assets.trnm_bcg
			objects.trnm_precards.forEach(c=>c.visible=false)
			this.init_cards()
			this.tables_updated(this.cached_trnm_data.tables)
			this.show_winner()
			
			objects.trnm_info1.alpha=1
			some_process.trnm_reg=()=>{objects.trnm_info1.alpha=Math.abs(Math.sin(TM.s*0.5))}
		}		
		
		if (state==='started'){	
			objects.trnm_reg_btn.visible=false
			objects.trnm_info1.text='Турнир начался!'
			objects.trnm_info2.text=`Раунд ${state_data.r+1}`
			if (state_data.r==2) objects.trnm_info2.text+=' (полуфинал)'
			if (state_data.r==3) objects.trnm_info2.text+=' (финал)'
			
			this.send_info3('Не выходите из меню турнира, чтобы не пропустить приглашение!')
			
			objects.bcg.texture=assets.trnm_bcg
			objects.trnm_precards.forEach(c=>c.visible=false)
			//console.log(`Раунд ${state_data.r} начался!`)
			this.init_cards()
			this.tables_updated(this.cached_trnm_data.tables)
			
			objects.trnm_info1.alpha=1
			some_process.trnm_reg=()=>{}
		}
		
		if (state==='round_fin'){
			objects.trnm_reg_btn.visible=false
			objects.trnm_info1.text='Турнир начался!'
			objects.trnm_info2.text=`Раунд ${state_data.r+1} окончен, ожидаем следующий раунд: `
			objects.bcg.texture=assets.trnm_bcg			
			objects.trnm_precards.forEach(c=>c.visible=false)
			this.init_cards()
			this.tables_updated(this.cached_trnm_data.tables)
			
			objects.trnm_info1.alpha=1
			some_process.trnm_reg=()=>{}
		}
		
	},
	
	secondsToHMS(seconds) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	},

	start_reg_process(){
		
		if (this.reg_process_on) return
		this.reg_process_on=1
		this.sec_to_start=null
		
		fbs.ref('trnm/tm_to_start').on('value',v=>{
			/*if (this.sec_to_start===null) {
				this.sec_to_start=1
				return
			}*/
			this.sec_to_start=v.val()
		})
		
		this.sec_to_start_timer=setInterval(()=>{
			if (this.sec_to_start===null) return
			if (this.sec_to_start>0) this.sec_to_start--
			objects.trnm_info2.text=this.secondsToHMS(this.sec_to_start)
		},1000)
		
	},
	
	stop_reg_process(){
		
		this.reg_process_on=0
		clearInterval(this.sec_to_start_timer)
		fbs.ref('trnm/tm_to_start').off()
		
	},
		
	show_winner(){
		
		const res=this.cached_trnm_data.tables['3_0']
		const fin_players=res.p
		const fin_score=res.s
		
		let winner_uid=null
		
		const cached_p1_data=this.cached_trnm_data.players[fin_players[0]]
		const cached_p2_data=this.cached_trnm_data.players[fin_players[1]]
		
		const p1_uid=cached_p1_data.uid
		const p2_uid=cached_p2_data.uid
		
		if (fin_score[0]>fin_score[1])	return p1_uid
		if (fin_score[0]<fin_score[1])	return p2_uid
				
		const r1=cached_p1_data.rating
		const r2=cached_p2_data.rating
		
		if (r1>r2)	return p1_uid
		return p2_uid
		
	},
	
	init_cards(){
		
		const cards_pos_data={rt_00:{x:0,y:20},rt_01:{x:0,y:100},rt_02:{x:0,y:221},rt_03:{x:0,y:301},rt_04:{x:660,y:20},rt_05:{x:660,y:100},rt_06:{x:660,y:220},rt_07:{x:660,y:300},rt_10:{x:140,y:60},rt_11:{x:140,y:260},rt_12:{x:520,y:60},rt_13:{x:520,y:260},rt_20:{x:250,y:160},rt_21:{x:410,y:160},rt_30:{x:330,y:250}}

		if(!this.TRNM_CONF)
			this.TRNM_CONF=[8,4,2,1]		

		const rounds_num=this.TRNM_CONF.length

		objects.trnm_cards.forEach(c=>c.visible=false)

		this.rounds_cards=[]

		//расставляем карточки столов
		let i=0
		for (let r=0;r<rounds_num;r++){
			this.rounds_cards[r]=[]
			for (let t=0;t<this.TRNM_CONF[r];t++){

				const trnm_card=objects.trnm_cards[i]
				const pos_data=cards_pos_data['rt_'+r+''+t]
				trnm_card.x=pos_data.x
				trnm_card.y=pos_data.y
				trnm_card.visible=true
				//trnm_card.alpha=0.25
				this.rounds_cards[r].push(trnm_card)
				i++
			}
		}
	},
	
	card_down(card){
		
		//console.log(this.cached_trnm_data.tables[card.rts])
				
		//если какая-то анимация или открыт диалог
		if (anim3.any_on()) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		
		const table_data=this.cached_trnm_data.tables[card.rts]
		if (!table_data.playing){
			

			if(table_data.empty){
				this.send_info3('Данный стол еще пуст!')
			}

			if(table_data.set){
				this.send_info3('Данный стол в ожидании следующей партии!')
			}
			
			if(table_data.fin){
				this.send_info3('Игры за данным столом завершены!')
			}
			
			
			
			return
		}

		const p1=table_data.p[0]
		const p2=table_data.p[1]

		const uid1=this.cached_trnm_data.players[p1].uid
		const uid2=this.cached_trnm_data.players[p2].uid		

		anim3.add(objects.td_cont, {x: [800, objects.td_cont.sx, 'linear']}, true, 0.1)

		objects.td_avatar1.set_texture(players_cache[uid1].texture);
		objects.td_avatar2.set_texture(players_cache[uid2].texture);

		objects.td_rating1.text = players_cache[uid1].rating;
		objects.td_rating2.text = players_cache[uid2].rating;

		objects.td_name1.set2(players_cache[uid1].name, 240);
		objects.td_name2.set2(players_cache[uid2].name, 240);
		
		objects.watch_button.visible=true	
		
		objects.watch_button.pointerdown=()=>{				
			this.peek_down(table_data.gid)
		}
		
	},
	
	peek_down(gid){

		if (anim3.any_on()) {
			sound.play('locked')
			return
		}
		
		sound.play('click')
		this.close()

		//активируем просмотр игры
		game_watching.activate({gid,trnm:1})
	},
	
	tables_updated(data){

		if (this.state==='reg') return
		if (!data) return
		
		sound.play('trnm_event')
		
		for (const r_t_s of Object.keys(data)){

			if (r_t_s==='info') continue
			
			const table_data=data[r_t_s]
			
			const rts=r_t_s.split('_')
			const round_id=+rts[0]
			const table_id=+rts[1]
			const tar_card=this.rounds_cards[round_id][table_id]
			tar_card.rts=r_t_s;
				
			if (data[r_t_s].p&&!table_data.empty){
				
				tar_card.avatar1.visible=true
				tar_card.avatar2.visible=true
				tar_card.bcg.texture=assets.trnm_card_bcg
				const players=data[r_t_s].p
				tar_card.uid1=this.cached_trnm_data.players[players[0]].uid
				tar_card.uid2=this.cached_trnm_data.players[players[1]].uid
				
				const uid1=this.cached_trnm_data.players[players[0]].uid
				const uid2=this.cached_trnm_data.players[players[1]].uid
				if (players_cache?.[uid1]?.texture){
					tar_card.avatar1.set_texture(players_cache[uid1].texture)					
					tar_card.t_name1.set2(players_cache[uid1].name,60)
				}
				else
					players_cache.update(uid1)
				
				if (players_cache?.[uid2]?.texture){
					tar_card.avatar2.set_texture(players_cache[uid2].texture)					
					tar_card.t_name2.set2(players_cache[uid2].name,60)
				}
				else
					players_cache.update(uid2)
				
			}
			
			if(table_data.playing){
				tar_card.bcg.texture=assets.trnm_card_playing_bcg
				tar_card.t_score.text=table_data.s.join(':')
			}

			if(table_data.empty){
				tar_card.bcg.texture=assets.trnm_card_empty_bcg
				tar_card.avatar1.visible=false
				tar_card.avatar2.visible=false
				tar_card.t_name1.text=''
				tar_card.t_name2.text=''
				tar_card.t_score.text=''
			}

			if(table_data.set){
				tar_card.bcg.texture=assets.trnm_card_set_bcg
				tar_card.t_score.text=table_data.s.join(':')
			}
			
			if(table_data.fin){
				tar_card.bcg.texture=assets.trnm_card_bcg
				tar_card.t_score.text=table_data.s.join(':')
			}

		}
	},

	reg_btn_down(){

		if (anim3.any_on()) {
			sound.play('locked')
			return
		}		
		
		if (this.state!=='reg') return
		fbs.ref('trnm/_players/'+my_data.uid).set(my_data.rating)
		anim3.add(objects.trnm_reg_btn, {alpha: [1, 0, 'linear']}, false, 0.25)

		this.send_info3('Заявка принята, не пропустите начало!')
	},
	
	reg_btn_set_state(s){
		
		this.reg_btn_state=s
		
		if (this.reg_btn_state)
			objects.trnm_reg_btn.texture=assets.trnm_stop_reg_btn_img
		else
			objects.trnm_reg_btn.texture=assets.trnm_reg_btn
		
	},

	cache_updated(uid,pdata){

		for (const card of objects.trnm_cards){
			
			if(!card.visible) continue
			
			if (card.uid1===uid){
				card.avatar1.set_texture(pdata.texture)
				card.t_name1.set2(pdata.name,60)
			}
			
			if (card.uid2===uid){
				card.avatar2.set_texture(pdata.texture)
				card.t_name2.set2(pdata.name,60)
			}
			
		}

		for (const card of objects.trnm_precards){
			if (card.uid===uid)
				card.set(pdata)
		}

		if (uid===this.winner_uid){
			const winner_name=players_cache[this.winner_uid].name
			objects.trnm_info2.text=`Победитель: ${winner_name}`
		}
	},

	inc_event(e){

		if (state!=='o') return
		if (!e) return
		if (e.trnm){
			console.log(`trnm event: ${JSON.stringify(e)}`)
			if (objects.big_msg_cont.visible)
				big_msg.close('forced')
			this.table_id=e.table_id
			const role=e.r===1?'master':'slave'
			game.activate({opp:online_game,role,t:1,opp_uid:e.opp_uid,gid:e.gid,brd_cfg:e.brd_cfg})
			this.close()
		}
	},
	
	process_game_end(e){
		
		//перенаправляем в турнир
		if (e===WIN)
			fbs.ref('trnm/events').set({game_end:online_game.gid,winner:my_data.uid,table_id:this.table_id,tm:Date.now()})
		if (e===LOSE)
			fbs.ref('trnm/events').set({game_end:online_game.gid,winner:opp_data.uid,table_id:this.table_id,tm:Date.now()})
		if (e===NOSYNC || e===DRAW)
			fbs.ref('trnm/events').set({game_end:online_game.gid,winner:0,table_id:this.table_id,tm:Date.now()})
		
	},

	close_btn_down(){
		
		if (anim3.any_on()) {
			sound.play('locked');
			return
		}
		
		sound.play('close')
		this.close()
		lobby.activate()

	},

	rules_close_down(){
		
		if (anim3.any_on()) {
			sound.play('locked');
			return
		}
		
		anim3.add(objects.trnm_rules_cont,{alpha:[1,0,'linear']}, false, 0.3);
		
	},

	async fill_players(){
		
		const pdata=[
			'debug84',
			'debug85',
			'debug86',
			'debug87',
			'debug88',
			'debug89',
			'debug90',
			'debug91',
			'debug92',
			'debug93',
			'debug94',
			'debug95',
			'debug96',
			'debug97',
			'debug98',
			'debug99'
		]
		
		for (const p of pdata){
			fbs.ref('trnm/_players/'+p).set(hf.randIntInc(1300,1400))
			await new Promise(res => setTimeout(res, 1000));
		}
		
	},

	close(){
		
		this.on=1
		if (objects.td_cont.visible) lobby.close_table_dialog()
		objects.bcg.texture=assets.bcg
		objects.trnm_cont.visible=false
		fbs.ref('trnm/state_data').off()
		fbs.ref('trnm/tables').off()
		fbs.ref('trnm/players').off()
	}

}

game = {

	opponent : '',
	selected_checker : 0,
	state : 'off',
	move_processor:0,
	trnm:0,
	
	async activate(params={}) {

		my_role = params.role
		
		//фиксируем айди соперника
		opp_data.uid=params.opp_uid

		objects.bcg.texture=assets.bcg;
		anim3.add(objects.bcg, {alpha: [0, 1, 'linear']}, true, 0.5)

		if (my_role==='master') {
			my_turn=1
			pmsg.add({t:['Ваши шашки в нижнем правом углу. Последний ход за соперником','Ready to play. The last move for the opponent'][LANG]})
		} else {
			my_turn=0
			pmsg.add({t:['Ваши шашки в нижнем правом углу. Последний ход за вами','Ready to play. The last move is yours'][LANG]})
		}

		//устанаваем вид моих и чужих фишек в зависимости у кого первый ход и текущего дизайна
		const design_name=DESIGN_DATA[my_data.design_id].name
		const chips_tex=[]
		chips_tex[1]=pref.design_loader.resources[design_name+'_chip1'].texture
		chips_tex[2]=pref.design_loader.resources[design_name+'_chip2'].texture
				
		brd_func.chips_tex[1]=chips_tex[2-my_turn]
		brd_func.chips_tex[2]=chips_tex[1+my_turn]

		//устанаваем текстуру
		const brd_tex=pref.design_loader.resources[design_name+'_board'].texture
		objects.board.texture=brd_tex
		objects.home_cfg.clear()

		//турнирная игра
		this.trnm=params.t

		if (this.opponent!=='') this.opponent.clear()
		if (objects.lb_1_cont.visible) lb.close()
		if (objects.chat_cont.visible) chat.close()
		if (game_watching.on) game_watching.close()
		if (lobby.on) lobby.close()
		if (trnm.on) trnm.close()


		//убираем бонусы
		objects.bonuses.forEach(b=>b.visible=false)
		
		//обновляем данные соперника на всякий случай
		await players_cache.update(opp_data.uid)

		//карточка и данные соперника
		const player_data=players_cache[opp_data.uid]
		opp_data.rating=player_data.rating||1400
		objects.opp_card_name.set2(player_data.name,150)
		objects.opp_card_rating.text=player_data.rating
		objects.opp_avatar_frame.texture=assets.avatar_frame
		objects.opp_avatar.texture=players_cache[opp_data.uid].texture
		anim3.add(objects.opp_card_cont, {x:[800, objects.opp_card_cont.sx, 'linear'],alpha: [0, 1, 'linear']}, true, 0.5)

		this.opponent=params.opp
		this.opponent.activate(params)
		this.move_processor=this.process_my_move

		//показываем и заполняем мою карточку
		objects.my_card_name.set2(my_data.name,150)
		objects.my_card_rating.text=my_data.rating
		objects.my_card_rating.visible=true
		objects.my_avatar.texture=players_cache[my_data.uid].texture
		anim3.add(objects.my_card_cont, {x:[-100, objects.my_card_cont.sx, 'linear'],alpha: [0, 1, 'linear']}, true, 0.5)

		sound.play('note')

		//это если перешли из бот игры
		this.selected_checker=0
		objects.selected_frame.visible=false

		//основные элементы игры
		objects.board_cont.visible=true
		objects.my_card_cont.visible=true
		objects.opp_card_cont.visible=true

		objects.cur_move_text.visible=true

		//обозначаем какой сейчас ход
		made_moves=0
		objects.cur_move_text.text=['Ход: ','Move: '][LANG]+made_moves

		//включаем взаимодейтсвие с доской
		objects.board.pointerdown = game.mouse_down_on_board.bind(game)
		objects.board.interactive=true

	},

	timer_tick() {



	},

	async get_safe_gid(){
				
		for (let i=0;i<100;i++){
			
			const gid=hf.randIntInc(1,999)
			const board_tm=await fbs_once('tables/'+gid+'/board/tm')
			if (!board_tm || SERVER_TM-board_tm>300_000)
				return gid
		}	
		
		return hf.randIntInc(1000,2000)
	},

	async give_up_down() {

		if (anim3.any_on()===true) {
			sound.play('locked');
			return
		}

		if (made_moves <5 ) {
			pmsg.add({t:['Нельзя сдаваться в начале игры','Can not giveup in beginning'][LANG]});
			return;
		}

		let res = await confirm_dialog.show(['Сдаетесь?','Giveup?'][LANG]);

		if (res === 'yes') {
			//отправляем сообщени о сдаче и завершаем игру
			fbs.ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"END",tm:Date.now(),data:{x1:0,y1:0,x2:0,y2:0,board_state:0}});
			game.stop('my_giveup');
		}

	},

	mouse_down_on_board(e) {

		if (anim3.any_on()) {
			sound.play('locked');
			return
		};

		//проверяем что моя очередь
		if (!my_turn) {
			pmsg.add({t:["Не твоя очередь","Not your turn"][LANG]});
			return;
		}

		//координаты указателя
		const mx = e.data.global.x/app.stage.scale.x-objects.board_cont.x+240;
		const my = e.data.global.y/app.stage.scale.y-objects.board_cont.y+240;

		//координаты указателя на игровой доске
		const new_x=Math.floor(8*(mx-objects.board.x-30)/400);
		const new_y=Math.floor(8*(my-objects.board.y-30)/400);

		//если выбрана новая шашка
		if (!this.selected_checker) {
			//находим шашку по координатам
			this.selected_checker=brd_func.get_checker_by_pos(new_x,new_y,objects.checkers);

			//если мою выбрали фишку
			if (this.selected_checker.m_id===1)
			{
				objects.selected_frame.x=this.selected_checker.x;
				objects.selected_frame.y=this.selected_checker.y;
				objects.selected_frame.visible=true;

				//воспроизводим соответствующий звук
				sound.play('move');

				return;
			}
			else
			{
				pmsg.add({t:["Это не ваши шашки","Not your checkers"][LANG]});
				this.selected_checker=0;
				return;
			}
		}

		if (this.selected_checker) {

			//если нажали на выделенную шашку то отменяем выделение
			if (new_x===this.selected_checker.ix && new_y===this.selected_checker.iy)
			{
				sound.play('move');
				this.selected_checker=0;
				objects.selected_frame.visible=false;
				return;
			}

			//формируем объект содержащий информацию о ходе
			const m_data={x1:this.selected_checker.ix,y1:this.selected_checker.iy,x2:new_x, y2:new_y};

			//пытыемся получить последовательность ходов
			const moves=brd_func.get_moves_path(m_data,g_board);

			//проверка
			if (!online_game.validate_move(m_data)){
				pmsg.add({t:["Нельзя повторять ходы","Invalid move"][LANG]});
				return;
			}

			if (moves.length!==11)
			{
				//убираем выделение
				objects.selected_frame.visible=false;

				//отменяем выделение
				this.selected_checker=0;

				//отправляем ход сопернику
				game.move_processor(m_data, moves);
			}
			else
			{
				pmsg.add({t:["Так нельзя ходить","Invalid move"][LANG]});
			}
		}

	},

	async process_my_move(move_data, moves) {

		//делаем перемещение шашки
		await brd_func.start_gentle_move(move_data, moves, g_board);

		//сообщаем в игры о ходе
		bot_game.make_move();
		online_game.process_my_move(move_data, moves);


		if (my_role === 'slave') {
			made_moves++;
			objects.cur_move_text.text=['cделано ходов: ','made moves: '][LANG]+made_moves;
			const result = brd_func2.get_brd_state(g_board, made_moves);
			if (result !== '') {
				this.stop(result);
				return;
			}
		}

		//уведомление что нужно вывести шашки из дома
		if (made_moves>24 && made_moves<31 ) {
			if (brd_func2.any1home(g_board))
				pmsg.add({t:['После 30 ходов не должно остаться шашек в доме','After 30 moves, there should be no checkers left in the house'][LANG]});
		}

		//уведомление что игра скоро закончиться
		if (made_moves>75 && made_moves<81 ) {
			pmsg.add({t:['После 80 хода выиграет тот кто перевел больше шашек в новый дом','After 80 moves, the one who transferred more checkers to the new house will win'][LANG]});
		}

		//перезапускаем таймер хода и кто ходит
		my_turn = 0;

		//обновляем таймер
		this.opponent.reset_timer();

		//обозначаем что я сделал ход и следовательно подтвердил согласие на игру
		this.opponent.me_conf_play=1;

	},

	async receive_move2(data) {

		const move_data={x1:+data[0],y1:+data[1],x2:+data[2],y2:+data[3]}
		//my_log.add({name:my_data.name,move_data,opp_name:opp_data.name,made_moves,my_turn,state:game.state,game_id,connected,tm:Date.now(),info:'rec_move'})

		//это чтобы не принимать ходы если игры нет (то есть выключен таймер)
		if (!['online','bot'].includes(game.state)) return;

		//защита от двойных ходов
		if (my_turn === 1) return;

		//воспроизводим уведомление о том что соперник произвел ход
		sound.play('receive_move');

		//обозначаем кто ходит
		my_turn = 1;

		//обозначаем что соперник сделал ход и следовательно подтвердил согласие на игру
		this.opponent.opp_conf_play = 1;

		//обновляем таймер
		this.opponent.reset_timer();

		//считаем последовательность ходов
		const moves = brd_func.get_moves_path(move_data,g_board);

		//плавно перемещаем шашку
		await brd_func.start_gentle_move(move_data, moves,g_board, objects.board, objects.checkers);

		//сообщаем в онлайн игру о ходе
		online_game.process_incoming_move(move_data, moves);

		if (my_role === 'master') {
			made_moves++;
			objects.cur_move_text.text="сделано ходов: "+made_moves;

			let result = brd_func2.get_brd_state(g_board, made_moves);

			//бота нельзя блокировать
			if (result === 'opp_left_after_30' && this.opponent === bot_game)	result = '';

			if (result !== '') {
				this.stop(result);
			}
		}

		//my_log.add({name:my_data.name,move_data,opp_name:opp_data.name,made_moves,my_turn,state:game.state,game_id,connected,tm:Date.now(),info:'rec_move_ok'})
	},

	async stop(result) {

		//игра закончена, показываем биг мсг
		this.state='big_msg'
		
		confirm_dialog.close_forced()

		const res=await this.opponent.stop(result)
		if (res==='forced') return

		objects.cur_move_text.visible=false
		objects.board_cont.visible=false
		objects.opp_card_cont.visible=false
		objects.my_card_cont.visible=false
		objects.selected_frame.visible=false
		//objects.checkers.forEach((c)=> {c.visible=false});

		//стираем данные оппонента
		opp_data.uid=''

		//соперника больше нет
		this.opponent = ''

		//игра закончена, показываем биг мсг
		this.state='ad'

		//рекламная пауза
		ad.show()
		await new Promise(r => setTimeout(r, 2000))
		
		//игра закончена, показываем биг мсг
		this.state='off'
		
		if (this.trnm)
			trnm.activate()
		else
			lobby.activate()

		//устанавливаем статус в базе данных а если мы не видны то установливаем только скрытое состояние
		set_state ({state : 'o'})
	}

}

game_watching={

	game_id:0,
	on:false,
	master_uid:'',
	slave_uid:'',
	game_over:0,
	prv_board:0,
	trnm:0,

	async activate(params={}){

		this.on=true
		
		this.game_id=params.gid;
		this.trnm=params.trnm

		objects.gw_back_button.visible=true;
		objects.my_card_cont.visible = true;
		objects.opp_card_cont.visible = true;
		objects.cur_move_text.visible=true;
		anim3.add(objects.board_cont, {alpha: [0, 1, 'linear']}, true, 0.3);
		objects.board.interactive=false;
		objects.gw_master_chip.visible=true;
		objects.gw_slave_chip.visible=true;
				
		const master_uid=await fbs_once('tables/'+this.game_id+'/master')
		const slave_uid=await fbs_once('tables/'+this.game_id+'/slave')
		
		if (!players_cache[master_uid])	await players_cache.update(master_uid)
		if (!players_cache[slave_uid])	await players_cache.update(slave_uid)
		
		const master_data=players_cache[master_uid]
		const slave_data=players_cache[slave_uid]		

		//аватарки
		objects.my_avatar.texture=master_data.texture;
		objects.opp_avatar.texture=slave_data.texture;

		//имена
		objects.my_card_name.set2(master_data.name,150);
		objects.opp_card_name.set2(slave_data.name,150);

		//рейтинги
		objects.my_card_rating.text=master_data.rating;
		objects.opp_card_rating.text=slave_data.rating;
		
		//
		const design_name=DESIGN_DATA[my_data.design_id].name
		const chips_tex=[]
		chips_tex[1]=pref.design_loader.resources[design_name+'_chip1'].texture
		chips_tex[2]=pref.design_loader.resources[design_name+'_chip2'].texture
				

		//устанаваем текстуру
		const brd_tex=pref.design_loader.resources[design_name+'_board'].texture
		objects.board.texture=brd_tex
		objects.home_cfg.clear()				
		
		objects.gw_master_chip.texture=brd_func.chips_tex[1]=chips_tex[1]
		objects.gw_slave_chip.texture=brd_func.chips_tex[2]=chips_tex[2]

		//устанаваем текстуру доски
		objects.opp_avatar_frame.texture=assets.avatar_frame;

		this.master_uid=master_uid;
		this.slave_uid=slave_uid;

		g_board=null;
		fbs.ref('tables/'+this.game_id+'/board').on('value',s => {
			game_watching.new_move(s.val());
		})

	},

	async new_move(board_data){

		console.log('Data size GW:', JSON.stringify(board_data).length);

		if(!this.on) return;

		if(!board_data || board_data?.f_str?.length>35){
			//g_board = [[2,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1]];
			//brd_func.update_board(g_board);
			return;
		}

		if(board_data.fin&&this.on){

			this.on=false;
			const res_array = {
				'my_timeout':LOSE,
				'opp_timeout':WIN,
				'my_giveup' :LOSE,
				'timer_error':LOSE,
				'opp_giveup':WIN,
				'both_finished':DRAW,
				'my_finished_first':WIN,
				'opp_finished_first':LOSE,
				'both_left_after_30':DRAW,
				'my_left_after_30':LOSE,
				'opp_left_after_30':WIN,
				'my_more_fin_after_80':WIN,
				'opp_more_fin_after_80':LOSE,
				'same_fin_after_80':DRAW,
				'my_no_sync':NOSYNC,
				'opp_no_sync':NOSYNC,
				'my_no_connection':LOSE,
				'my_stop':DRAW
			};

			const res=res_array[board_data.fin];

			let winner_name='';
			if (res===WIN)
				winner_name=players_cache[board_data.uid].name;

			if (res===LOSE){
				const switcher={}
				switcher[this.slave_uid]=this.master_uid;
				switcher[this.master_uid]=this.slave_uid;
				const winner_uid=switcher[board_data.uid];
				winner_name=players_cache[winner_uid].name;
			}


			const name=players_cache[board_data.uid].name;
			if (res===WIN||res===LOSE)
				await big_msg.show({t1:[`Эта игра завершена\nПобедитель: ${winner_name}.`,'This game is over'][LANG],t2:')))',t3:'',fb:0});
			else
				await big_msg.show({t1:['Эта игра завершена.','This game is over'][LANG],t2:')))',t3:'',fb:0});


			this.close();
			if (this.trnm)
				trnm.activate();
			else
				lobby.activate();
			return;
		}

		//если предыдущее движение не завершено то завершаем его и ждем
		while (moving_chip&&!moving_chip.ready) {
			//anim3.kill_anim(moving_chip);
			await new Promise(resolve => setTimeout(resolve, 100)); // wait for 1 second
		}

		const old_board=JSON.parse(JSON.stringify(g_board));

		const b_str = board_data.f_str.slice(0, 24);
		const move = +board_data.f_str.slice(24);
		const uid=board_data.uid;
		const new_board=brd_func.str_to_brd(b_str);

		if (!document.hidden){
			if (uid===this.master_uid){
				anim3.add(objects.opp_card_cont, {alpha: [0.25, 1, 'linear']}, true, 0.3, false);
				anim3.add(objects.my_card_cont, {alpha: [1, 0.25, 'linear']}, true, 0.3, false);
			}else{
				anim3.add(objects.opp_card_cont, {alpha: [1, 0.25, 'linear']}, true, 0.3, false);
				anim3.add(objects.my_card_cont, {alpha: [0.25, 1, 'linear']}, true, 0.3, false);
			}
		}

		if (uid===this.slave_uid)
			brd_func.rotate_board(new_board)

		//если старой доски еще нет
		if (!g_board){
			g_board=new_board;
			brd_func.update_board(g_board);
			return;
		}

		//опредеяем кто ушел
		let fig_to_move,tx,ty;
		let move_data={x1:0,y1:0,x2:0,y2:0};
		for (let x = 0; x < 8; x++) {
			for (let y = 0; y < 8; y++) {
				const fig0 = old_board[y][x];
				const fig1 = new_board[y][x];

				if (fig0!==0 && fig1===0){
					move_data.x1=x;
					move_data.y1=y;
				}

				if (fig0===0 && fig1!==0){
					move_data.x2=x;
					move_data.y2=y;
				}
			}
		}
		const moves=brd_func.get_moves_path(move_data,g_board);
		await brd_func.start_gentle_move(move_data,moves,g_board);
		brd_func.update_board(new_board);
		g_board=new_board;
		if (move) objects.cur_move_text.text=['сделано ходов: ','made moves: '][LANG]+move;

	},

	back_btn_down(){

		if (anim3.any_on()) {
			sound.play('locked');
			return
		};

		sound.play('click');
		this.close();
		
		if (this.trnm)
			trnm.activate();
		else
			lobby.activate();
	},

	close(){

		//восстанавливаем мое имя так как оно могло меняться
		objects.my_card_name.set2(my_data.name,150);
		objects.my_card_rating.text = my_data.rating;


		anim3.kill_anim(objects.my_card_cont);
		anim3.kill_anim(objects.opp_card_cont);

		objects.my_avatar.texture=objects.id_avatar.texture;
		objects.gw_back_button.visible=false;
		objects.board_cont.visible=false;
		objects.cur_move_text.visible=false;
		objects.my_card_cont.visible = false;
		objects.opp_card_cont.visible = false;
		objects.gw_master_chip.visible=false;
		objects.gw_slave_chip.visible=false;
		fbs.ref('tables/'+this.game_id+'/board').off();


	}

}

keyboard={

	ru_keys:[[54.38,100,88.52,139.24,'1'],[99.9,100,134.04,139.24,'2'],[145.41,100,179.55,139.24,'3'],[190.93,100,225.07,139.24,'4'],[236.45,100,270.59,139.24,'5'],[281.97,100,316.11,139.24,'6'],[327.48,100,361.62,139.24,'7'],[373,100,407.14,139.24,'8'],[418.52,100,452.66,139.24,'9'],[464.03,100,498.17,139.24,'0'],[556.21,100,613.11,139.24,'<'],[77.14,149.05,111.28,188.29,'Й'],[122.66,149.05,156.8,188.29,'Ц'],[168.17,149.05,202.31,188.29,'У'],[213.69,149.05,247.83,188.29,'К'],[259.21,149.05,293.35,188.29,'Е'],[304.72,149.05,338.86,188.29,'Н'],[350.24,149.05,384.38,188.29,'Г'],[395.76,149.05,429.9,188.29,'Ш'],[441.28,149.05,475.42,188.29,'Щ'],[486.79,149.05,520.93,188.29,'З'],[532.31,149.05,566.45,188.29,'Х'],[577.83,149.05,611.97,188.29,'Ъ'],[99.9,198.09,134.04,237.33,'Ф'],[145.41,198.09,179.55,237.33,'Ы'],[190.93,198.09,225.07,237.33,'В'],[236.45,198.09,270.59,237.33,'А'],[281.97,198.09,316.11,237.33,'П'],[327.48,198.09,361.62,237.33,'Р'],[373,198.09,407.14,237.33,'О'],[418.52,198.09,452.66,237.33,'Л'],[464.03,198.09,498.17,237.33,'Д'],[509.55,198.09,543.69,237.33,'Ж'],[555.07,198.09,589.21,237.33,'Э'],[77.14,247.14,111.28,286.38,'!'],[122.66,247.14,156.8,286.38,'Я'],[168.17,247.14,202.31,286.38,'Ч'],[213.69,247.14,247.83,286.38,'С'],[259.21,247.14,293.35,286.38,'М'],[304.72,247.14,338.86,286.38,'И'],[350.24,247.14,384.38,286.38,'Т'],[395.76,247.14,429.9,286.38,'Ь'],[441.28,247.14,475.42,286.38,'Б'],[486.79,247.14,520.93,286.38,'Ю'],[578.97,247.14,613.11,286.38,')'],[510.69,100,544.83,139.24,'?'],[31.62,296.18,202.31,346,'ЗАКРЫТЬ'],[213.69,296.18,475.41,346,' '],[486.79,296.18,646.1,346,'ОТПРАВИТЬ'],[601.72,198.09,635.86,237.33,','],[533.45,247.14,567.59,286.38,'('],[31.62,198.09,88.52,237.33,'EN']],
	en_keys:[[56.65,100,90.78,139.08,'1'],[102.15,100,136.28,139.08,'2'],[147.66,100,181.79,139.08,'3'],[193.17,100,227.3,139.08,'4'],[238.68,100,272.81,139.08,'5'],[284.18,100,318.31,139.08,'6'],[329.69,100,363.82,139.08,'7'],[375.2,100,409.33,139.08,'8'],[420.71,100,454.84,139.08,'9'],[466.22,100,500.35,139.08,'0'],[558.37,100,615.25,139.08,'<'],[124.91,148.85,159.04,187.93,'Q'],[170.41,148.85,204.54,187.93,'W'],[215.92,148.85,250.05,187.93,'E'],[261.43,148.85,295.56,187.93,'R'],[306.94,148.85,341.07,187.93,'T'],[352.45,148.85,386.58,187.93,'Y'],[397.95,148.85,432.08,187.93,'U'],[443.46,148.85,477.59,187.93,'I'],[488.97,148.85,523.1,187.93,'O'],[534.48,148.85,568.61,187.93,'P'],[147.66,197.69,181.79,236.77,'A'],[193.17,197.69,227.3,236.77,'S'],[238.68,197.69,272.81,236.77,'D'],[284.18,197.69,318.31,236.77,'F'],[329.69,197.69,363.82,236.77,'G'],[375.2,197.69,409.33,236.77,'H'],[420.71,197.69,454.84,236.77,'J'],[466.22,197.69,500.35,236.77,'K'],[511.72,197.69,545.85,236.77,'L'],[535.61,246.54,569.74,285.62,'('],[79.4,246.54,113.53,285.62,'!'],[170.41,246.54,204.54,285.62,'Z'],[215.92,246.54,250.05,285.62,'X'],[261.43,246.54,295.56,285.62,'C'],[306.94,246.54,341.07,285.62,'V'],[352.45,246.54,386.58,285.62,'B'],[397.95,246.54,432.08,285.62,'N'],[443.46,246.54,477.59,285.62,'M'],[581.12,246.54,615.25,285.62,')'],[512.86,100,546.99,139.08,'?'],[33.89,295.39,204.54,346,'CLOSE'],[215.92,295.39,477.59,346,' '],[488.97,295.39,648.25,346,'SEND'],[603.88,197.69,638.01,236.77,','],[33.89,197.69,90.77,236.77,'RU']],
	layout:0,
	resolver:0,

	MAX_SYMBOLS : 60,

	read(max_symb){

		this.MAX_SYMBOLS=max_symb||60;
		if (!this.layout)this.switch_layout();

		//если какой-то ресолвер открыт
		if(this.resolver) {
			this.resolver('');
			this.resolver=0;
		}

		objects.chat_keyboard_text.text ='';
		objects.chat_keyboard_control.text = `0/${this.MAX_SYMBOLS}`

		anim3.add(objects.chat_keyboard_cont, {y: [450, objects.chat_keyboard_cont.sy, 'linear']}, true, 0.2);


		return new Promise(resolve=>{
			this.resolver=resolve;
		})

	},

	keydown (key) {

		//*******это нажатие с клавиатуры
		if(!objects.chat_keyboard_cont.visible) return;

		key = key.toUpperCase();

		if(key==='BACKSPACE') key ='<';
		if(key==='ENTER') key ='ОТПРАВИТЬ';
		if(key==='ESCAPE') key ='ЗАКРЫТЬ';

		let key2 = this.layout.find(k => {return k[4] === key})

		this.process_key(key2)

	},

	get_key_from_touch(e){

		//координаты нажатия в плостоки спрайта клавиатуры
		let mx = e.data.global.x/app.stage.scale.x - objects.chat_keyboard_cont.x-10;
		let my = e.data.global.y/app.stage.scale.y - objects.chat_keyboard_cont.y-10;

		//ищем попадание нажатия на кнопку
		let margin = 5;
		for (let k of this.layout)
			if (mx > k[0] - margin && mx <k[2] + margin  && my > k[1] - margin && my < k[3] + margin)
				return k;
		return null;
	},

	highlight_key(key_data){

		const [x,y,x2,y2,key]=key_data

		//подсвечиваем клавишу
		objects.chat_keyboard_hl.width=x2-x+20;
		objects.chat_keyboard_hl.height=y2-y+20;

		objects.chat_keyboard_hl.x = x+objects.chat_keyboard.x-10;
		objects.chat_keyboard_hl.y = y+objects.chat_keyboard.y-10;

		anim3.add(objects.chat_keyboard_hl, {alpha: [1, 0, 'linear']}, false, 0.5);

	},

	pointerdown (e) {

		//if (!game.on) return;

		//получаем значение на которое нажали
		const key=this.get_key_from_touch(e);

		//дальнейшая обработка нажатой команды
		this.process_key(key);
	},

	response_message(uid, name) {

		objects.chat_keyboard_text.text = name.split(' ')[0]+', ';
		objects.chat_keyboard_control.text = `${objects.chat_keyboard_text.text.length}/${keyboard.MAX_SYMBOLS}`

	},

	switch_layout(){

		if (this.layout===this.ru_keys){
			this.layout=this.en_keys;
			objects.chat_keyboard.texture=assets.eng_layout;
		}else{
			this.layout=this.ru_keys;
			objects.chat_keyboard.texture=assets.rus_layout;
		}

	},

	process_key(key_data){

		if(!key_data) return;

		let key=key_data[4];

		//звук нажатой клавиши
		sound.play('keypress');

		const t=objects.chat_keyboard_text.text;
		if ((key==='ОТПРАВИТЬ'||key==='SEND')&&t.length>0){
			this.resolver(t);
			this.resolver=0;
			this.close();
			key ='';
		}

		if (key==='ЗАКРЫТЬ'||key==='CLOSE'){
			this.resolver(0);
			this.close();
			key ='';
		}

		if (key==='RU'||key==='EN'){
			this.switch_layout();
			key ='';
		}

		if (key==='<'){
			objects.chat_keyboard_text.text=t.slice(0, -1);
			key ='';
		}

		if (t.length>=this.MAX_SYMBOLS) return;

		//подсвечиваем...
		this.highlight_key(key_data);

		//добавляем значение к слову
		if (key.length===1) objects.chat_keyboard_text.text+=key;

		objects.chat_keyboard_control.text = `${objects.chat_keyboard_text.text.length}/${this.MAX_SYMBOLS}`

	},

	close () {

		//на всякий случай уничтожаем резолвер
		if (this.resolver) this.resolver(0);
		anim3.add(objects.chat_keyboard_cont, {y: [objects.chat_keyboard_cont.y, 450, 'linear']}, false, 0.2);

	},

}

ad={

	async show() {

		PIXI.sound.muteAll()

		if (game_platform==="YANDEX") {
			await new Promise(res=>{
				const timeout=setTimeout(()=>{res()},5000)
				window.ysdk.adv.showFullscreenAdv({
				callbacks: {
					onClose: function() {res();clearTimeout(timeout)},
					onError: function() {res();clearTimeout(timeout)}
					}
				})
			})
		}

		if (game_platform==='VK' || game_platform==='OK') {

			await new Promise(res => {
				const timeoutId = setTimeout(() => {res(1)}, 5000)
				vkBridge.send("VKWebAppShowNativeAds", { ad_format: "interstitial" })
					.then(data => {
						clearTimeout(timeoutId);
						res(1)
				})
				.catch(error => {
						clearTimeout(timeoutId)
						res(0)
				})
			})
		}

		if (game_platform==='GOOGLE_PLAY') {
			if (typeof Android !== 'undefined') {
				Android.showAdFromJs();
			}
		}
		
		PIXI.sound.unmuteAll()
		

	},

	async show2() {


		if (game_platform ==="YANDEX") {

			let res = await new Promise(function(resolve, reject){
				window.ysdk.adv.showRewardedVideo({
						callbacks: {
						  onOpen: () => {},
						  onRewarded: () => {resolve('ok')},
						  onClose: () => {resolve('err')},
						  onError: (e) => {resolve('err')}
					}
				})

			})
			return res;
		}

		if (game_platform === "VK") {

			let data = '';
			try {
				data = await vkBridge.send("VKWebAppShowNativeAds", { ad_format: "reward" })
			}
			catch(error) {
				data ='err';
			}

			if (data.result) return 'ok'


		}

		return 'err';

	}
}

confirm_dialog = {

	p_resolve : 0,

	show(msg) {

		if (objects.confirm_cont.visible === true) {
			sound.play('locked')
			return;
		}

		sound.play("confirm_dlg")

		objects.confirm_msg.text=msg

		anim3.add(objects.confirm_cont, {y: [450, objects.confirm_cont.sy, 'easeOutBack']}, true, 0.3)

		return new Promise(function(resolve, reject){
			confirm_dialog.p_resolve = resolve;
		});
	},

	button_down(res) {

		if (anim3.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click')

		this.close();
		this.p_resolve(res);

	},

	close_forced(){

		objects.confirm_cont.visible=false
		if (typeof(this.p_resolve.then)==='function')
			this.p_resolve('111');

	},

	close () {

		anim3.add(objects.confirm_cont, {y: [objects.confirm_cont.sy, 450, 'easeInBack']}, false, 0.3)

	}

}

keep_alive = function() {

	if (document.hidden) return;

	fbs.ref('players/'+my_data.uid+'/tm').set(firebase.database.ServerValue.TIMESTAMP);
	fbs.ref('inbox/'+my_data.uid).onDisconnect().remove();
	fbs.ref(ROOM_NAME+'/'+my_data.uid).onDisconnect().remove();

	set_state({});
}

minimax_solver = {

bad_1:[[-4,-4,0,8,25,41,61,85],[-2,-2,2,10,27,43,63,87],[4,4,8,16,33,49,69,93],[19,19,23,31,43,59,79,103],[33,33,37,45,57,73,93,117],[51,51,55,63,75,91,111,135],[73,73,77,85,97,113,133,157],[99,99,103,111,123,139,159,183]],
patterns:[[[0,1,1],[0,2,1],[1,0,1],[2,0,1]],[[0,1,2],[0,2,1],[0,3,1],[1,0,2],[2,0,1],[3,0,1]],[[0,1,1],[0,2,2],[1,0,1],[1,2,1],[2,0,2],[2,1,1]],[[0,1,1],[0,2,2],[0,3,1],[1,0,2],[2,0,1],[3,0,1]],[[0,1,2],[0,2,1],[0,3,1],[1,0,1],[2,0,2],[3,0,1]],[[0,1,1],[0,2,2],[1,0,2],[1,2,1],[2,0,1],[3,0,1]],[[0,1,2],[0,2,1],[0,3,1],[1,0,1],[2,0,2],[2,1,1]],[[0,1,1],[0,2,1],[1,0,1],[2,0,2],[2,1,1]],[[0,1,1],[0,2,2],[1,0,1],[1,2,1],[2,0,1]],[[0,1,2],[0,2,2],[1,0,2],[1,1,1],[1,2,1],[2,0,1]],[[0,1,2],[0,2,1],[1,0,2],[1,1,1],[2,0,2],[2,1,1]],[[0,1,2],[0,2,1],[0,3,1],[1,0,1],[2,0,1]],[[0,1,1],[0,2,1],[1,0,2],[2,0,1],[3,0,1]],[[0,1,2],[0,2,1],[1,0,1],[1,1,1],[2,0,1]],[[0,1,1],[0,2,1],[1,0,2],[1,1,1],[2,0,1]],[[0,1,1],[0,2,2],[1,0,1],[1,2,1],[2,0,1]],[[0,1,1],[0,2,1],[1,0,1],[2,0,2],[2,1,1]],[[0,1,1],[0,2,2],[0,3,1],[1,0,1],[2,0,1]],[[0,1,1],[0,2,1],[1,0,1],[2,0,2],[3,0,1]],[[0,1,2],[0,2,1],[1,0,2],[1,1,1],[2,0,1],[3,0,1]],[[0,1,2],[0,2,1],[0,3,1],[1,0,2],[1,1,1],[2,0,1]]],
fin_moves:[[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,5,5,6,5,7,6,3,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,2,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,3,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,3,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,2,5,3,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,3,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,3,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,3,5,3,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,3,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,3,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,7,5,3,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[5,3,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[5,3,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,5,7,6,7,7],[5,2,5,3,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,5,7,6,7,7],[5,3,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,5,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,3,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,4,4,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,6,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,7,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,3,4,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,6,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,4,4,7,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,5,7,6,7,7],[3,4,4,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,5,7,6,7,7],[4,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[5,4,5,6,5,7,6,3,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,2,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,3,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,2,5,3,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,3,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,3,5,4,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,3,5,4,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,3,5,4,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,3,5,3,5,4,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,3,5,4,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,7,5,3,5,4,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[5,3,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[5,3,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[5,3,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,6,7,7],[4,6,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,5,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,3,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,3,5,4,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,7,5,4,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,4,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,4,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,5,4,7,5,4,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,5,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,5,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,6,7,7],[3,5,4,5,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,6,7,7],[4,7,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,6,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,3,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,6,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,3,5,4,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,4,7,5,4,5,5,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,6,5,4,5,5,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,5,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,4,7,5,4,5,5,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,5,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,6,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,7],[3,6,4,6,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,7,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,3,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,7,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,3,5,4,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,7,5,4,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,4,7,5,4,5,5,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,7,5,4,5,5,5,6,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,7,5,4,5,5,5,6,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,4,7,5,4,5,5,5,6,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6],[3,7,4,7,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6],[5,5,5,6,5,7,6,3,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,3,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,2,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,3,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,2,6,3,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,3,6,5,6,7,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,3,6,5,6,6,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,5,6,6,6,7,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[5,3,5,4,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,3,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,4,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,3,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,4,4,4,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,3,5,4,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,4,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,6,5,4,5,5,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,7,5,4,5,5,5,6,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,4,5,5,5,6,5,7,6,6,6,7,7,4,7,5,7,6,7,7],[4,3,4,4,5,4,5,5,5,6,5,7,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,4,4,6,5,4,5,5,5,6,5,7,6,5,6,7,7,4,7,5,7,6,7,7],[4,4,4,7,5,4,5,5,5,6,5,7,6,5,6,6,7,4,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[5,3,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,6,5,7,6,3,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,3,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,2,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,2,6,3,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,3,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,3,6,4,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,3,6,4,6,6,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,3,6,4,6,6,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,3,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,3,7,4,7,6,7,7],[5,3,5,4,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,5,6,6,6,7,7,4,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[3,5,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,3,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,3,5,4,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[3,5,4,5,5,4,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,5,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,7,5,4,5,5,5,6,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,3,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,4,5,5,5,6,5,7,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,5,5,6,5,7,6,4,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,4,5,5,5,6,5,7,6,4,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,3,6,4,6,6,7,4,7,5,7,6,7,7],[4,5,4,7,5,4,5,5,5,6,5,7,6,4,6,6,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,3,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,3,7,4,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[3,6,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,5,3,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,4,4,6,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,5,3,5,4,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,6,4,6,5,4,5,5,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,4,7,5,4,5,5,5,6,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,3,6,5,6,7,7,4,7,5,7,6,7,7],[4,4,4,6,5,4,5,5,5,6,5,7,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,3,6,4,6,7,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,5,5,6,5,7,6,4,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,6,4,7,5,4,5,5,5,6,5,7,6,4,6,5,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,5,5,6,5,7,6,4,6,5,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,3,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,3,7,4,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[3,7,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,7,5,3,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,4,4,7,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,7,5,3,5,4,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,5,4,7,5,4,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,6,4,7,5,4,5,5,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,7,4,7,5,4,5,5,5,6,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,3,6,5,6,6,7,4,7,5,7,6,7,7],[4,4,4,7,5,4,5,5,5,6,5,7,6,5,6,6,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,3,6,4,6,6,7,4,7,5,7,6,7,7],[4,5,4,7,5,4,5,5,5,6,5,7,6,4,6,6,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,4,7,5,4,5,5,5,6,5,7,6,4,6,5,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,3,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,3,7,4,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6],[5,3,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[5,3,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,5,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,6,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,3,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,3,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,3,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,3,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,3,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,2,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,5,6,6,6,7,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,5,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,2,7,3,7,5,7,7],[5,3,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[5,3,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,5,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,6,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,7,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,3,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,3,7,4,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,3,7,4,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,3,7,4,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,3,7,4,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,2,7,4,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,5,6,6,6,7,7,4,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,2,7,3,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,5,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,5,7,6]],

	get_childs(board_dataU, checkers, forward){

		function check_in_hist(x,y, hist) {
			for (let i=0;i<hist.length;i++)
				if (x===hist[i][0] && y===hist[i][1])
					return true;
			return false;
		}

		function left(ix,iy,cur_boardU,moves_hist,boards_array) {

			let new_x=ix-1;
			let new_y=iy;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;

			if (cur_boardU[new_y*8+new_x]===0) {
				cur_boardU[iy*8+ix]=0;
				cur_boardU[new_y*8+new_x]=checkers;
				boards_array.push([cur_boardU,ix,iy,new_x,new_y]);
				return;
			}
			else {
				left_combo(ix,iy,cur_boardU,moves_hist,boards_array);
			}
		}

		function right(ix,iy,cur_boardU,moves_hist,boards_array) {
			let new_x=ix+1;
			let new_y=iy;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;

			if (cur_boardU[new_y*8+new_x]===0) {
				cur_boardU[iy*8+ix]=0;
				cur_boardU[new_y*8+new_x]=checkers;
				boards_array.push([cur_boardU,ix,iy,new_x,new_y]);
				return
			} else {
				right_combo(ix,iy,cur_boardU,moves_hist,boards_array);
			}
		}

		function up(ix,iy,cur_boardU,moves_hist,boards_array){
			let new_x=ix;
			let new_y=iy-1;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;

			if (cur_boardU[new_y*8+new_x]===0) {
				cur_boardU[iy*8+ix]=0;
				cur_boardU[new_y*8+new_x]=checkers;
				boards_array.push([cur_boardU,ix,iy,new_x,new_y]);
				return
			} else {
				up_combo(ix,iy,cur_boardU,moves_hist,boards_array);
			}
		}

		function down(ix,iy,cur_boardU,moves_hist,boards_array){
			let new_x=ix;
			let new_y=iy+1;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;

			if (cur_boardU[new_y*8+new_x]===0) {
				cur_boardU[iy*8+ix]=0;
				cur_boardU[new_y*8+new_x]=checkers;
				boards_array.push([cur_boardU,ix,iy,new_x,new_y]);
				return
			} else {
				down_combo(ix,iy,cur_boardU,moves_hist,boards_array);
			}
		}

		function left_combo(ix,iy,cur_boardU,moves_hist,boards_array) {

			let new_x=ix-2;
			let new_y=iy;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;
			if (cur_boardU[iy*8+ix-1]===0) return;

			if (cur_boardU[new_y*8+new_x]===0)
			{

				if (check_in_hist(new_x,new_y,moves_hist)===true) return;

				moves_hist.push([ix,iy]);
				cur_boardU[new_y*8+new_x]=cur_boardU[iy*8+ix];
				cur_boardU[iy*8+ix]=0;

				let d_move=(new_x-moves_hist[0][0])+(new_y-moves_hist[0][1]);
				if (cur_boardU[new_y*8+new_x]===1)
					d_move=-d_move;

				if (d_move>min_move_amount)
					boards_array.push([new Uint8Array(cur_boardU),moves_hist[0][0],moves_hist[0][1],new_x,new_y]);

				//продолжаем попытки комбо
				left_combo(new_x,new_y,cur_boardU,moves_hist,boards_array);
				up_combo(new_x,new_y,cur_boardU,moves_hist,boards_array);
				down_combo(new_x,new_y,cur_boardU,moves_hist,boards_array);
			}
		}

		function right_combo(ix,iy,cur_boardU,moves_hist,boards_array) {

			let new_x=ix+2;
			let new_y=iy;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;
			if (cur_boardU[iy*8+ix+1]===0) return;

			if (cur_boardU[new_y*8+new_x]===0)
			{

				if (check_in_hist(new_x,new_y,moves_hist)===true) return;

				moves_hist.push([ix,iy]);
				cur_boardU[new_y*8+new_x]=cur_boardU[iy*8+ix];
				cur_boardU[iy*8+ix]=0;

				let d_move=(new_x-moves_hist[0][0])+(new_y-moves_hist[0][1]);
				if (cur_boardU[new_y*8+new_x]===1)
					d_move=-d_move;

				if (d_move>min_move_amount)
					boards_array.push([new Uint8Array(cur_boardU),moves_hist[0][0],moves_hist[0][1],new_x,new_y]);

				//продолжаем попытки комбо
				right_combo(new_x,new_y,cur_boardU,moves_hist,boards_array);
				up_combo(new_x,new_y,cur_boardU,moves_hist,boards_array);
				down_combo(new_x,new_y,cur_boardU,moves_hist,boards_array);
			}
		}

		function up_combo(ix,iy,cur_boardU,moves_hist,boards_array) {

			let new_x=ix;
			let new_y=iy-2;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;
			if (cur_boardU[(iy-1)*8+ix]===0) return;

			if (cur_boardU[new_y*8+new_x]===0)
			{

				if (check_in_hist(new_x,new_y,moves_hist)===true) return;

				moves_hist.push([ix,iy]);
				cur_boardU[new_y*8+new_x]=cur_boardU[iy*8+ix];
				cur_boardU[iy*8+ix]=0;

				let d_move=(new_x-moves_hist[0][0])+(new_y-moves_hist[0][1]);
				if (cur_boardU[new_y*8+new_x]===1)
					d_move=-d_move;

				if (d_move>min_move_amount)
					boards_array.push([new Uint8Array(cur_boardU),moves_hist[0][0],moves_hist[0][1],new_x,new_y]);

				//продолжаем попытки комбо
				right_combo(new_x,new_y,cur_boardU,moves_hist,boards_array);
				up_combo(new_x,new_y,cur_boardU,moves_hist,boards_array);
				left_combo(new_x,new_y,cur_boardU,moves_hist,boards_array);
			}
		}

		function down_combo(ix,iy,cur_boardU,moves_hist,boards_array) {

			let new_x=ix;
			let new_y=iy+2;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;
			if (cur_boardU[(iy+1)*8+ix]===0) return;

			if (cur_boardU[new_y*8+new_x]===0)
			{
				if (check_in_hist(new_x,new_y,moves_hist)===true) return;

				moves_hist.push([ix,iy]);
				cur_boardU[new_y*8+new_x]=cur_boardU[iy*8+ix];
				cur_boardU[iy*8+ix]=0;

				let d_move=(new_x-moves_hist[0][0])+(new_y-moves_hist[0][1]);
				if (cur_boardU[new_y*8+new_x]===1)
					d_move=-d_move;

				if (d_move>min_move_amount)
					boards_array.push([new Uint8Array(cur_boardU),moves_hist[0][0],moves_hist[0][1],new_x,new_y]);

				//продолжаем попытки комбо
				right_combo(new_x,new_y,cur_boardU,moves_hist,boards_array);
				down_combo(new_x,new_y,cur_boardU,moves_hist,boards_array);
				left_combo(new_x,new_y,cur_boardU,moves_hist,boards_array);
			}
		}

		let boards_array=[];

		if (forward===1) {

			if (checkers===1) {
				for (let y=0;y<8;y++) {
					for (let x=0;x<8;x++) {
						if (board_dataU[y*8+x]===checkers) {
							let moves_hist=[[x,y]];
							left	(		x,y,	new Uint8Array(board_dataU),	moves_hist, boards_array);
							up		(		x,y,	new Uint8Array(board_dataU),	moves_hist, boards_array);
						}
					}
				}
			}

			if (checkers===2) {

				for (let y=0;y<8;y++) {
					for (let x=0;x<8;x++) {
						if (board_dataU[y*8+x]===checkers) {
							let moves_hist=[[x,y]];
							right	(		x,y,	new Uint8Array(board_dataU),	moves_hist, boards_array);
							down	(		x,y,	new Uint8Array(board_dataU),	moves_hist, boards_array);
						}
					}
				}
			}
		} else {

			for (let y=0;y<8;y++) {
				for (let x=0;x<8;x++) {
					if (board_dataU[y*8+x]===checkers) {
						let moves_hist=[[x,y]];
						right	(		x,y,	new Uint8Array(board_dataU),	moves_hist, boards_array);
						down	(		x,y,	new Uint8Array(board_dataU),	moves_hist, boards_array);
						left	(		x,y,	new Uint8Array(board_dataU),	moves_hist, boards_array);
						up		(		x,y,	new Uint8Array(board_dataU),	moves_hist, boards_array);
					}
				}
			}
		}


		return boards_array;

	},

	make_weights_board(made_moves) {

		let p=made_moves/60+0.5;
		for (let y=0;y<8;y++) {
			for (let x=0;x<8;x++) {
				this.bad_1[y][x]=Math.pow(x*x+y*y,p)+Math.pow((1-x)*(1-x)+y*y,p);
			}
		}
	},

	make_weights_board2(made_moves) {

		let r_num = Math.random()*0.8 + 0.2;
		let p=made_moves/60+0.5;
		for (let y=0;y<8;y++) {
			for (let x=0;x<8;x++) {
				this.bad_1[y][x]=r_num * Math.pow(x*x+y*y,p)+ (1 - r_num ) * Math.pow((1-x)*(1-x)+y*y,p);
			}
		}

		if (made_moves>37) {

			for (let y=5;y<8;y++) {
				for (let x=4;x<8;x++) {
					this.bad_1[y][x]=9999;
				}
			}

		}

	},

	board_val(boardU, made_moves) {

		let val_1=0;
		let val_2=0;


		for (let y=0;y<8;y++) {
			for (let x=0;x<8;x++) {

				if (boardU[y*8+x]===1)
					val_1-=this.bad_1[y][x];

				if (boardU[y*8+x]===2)
					val_2-=this.bad_1[7-y][7-x];
			}
		}

		//вычисляем блокированных 2 и добавляем как бонус к 1 dxdy положительный
		for (let y=0;y<3;y++) {
			for (let x=0;x<4;x++) {
				if (boardU[y*8+x]===2) {
					for (let p=0;p<this.patterns.length;p++) {

						let pattern_ok=1;
						for (let r=0;r<this.patterns[p].length;r++) {
							let dy=this.patterns[p][r][0];
							let dx=this.patterns[p][r][1];
							let ch=this.patterns[p][r][2];

							if (boardU[(y+dy)*8+x+dx]!==ch) {
								pattern_ok=0;
								break;
							}

						}
						val_1+=pattern_ok*1000;
					}
				}
			}
		}

		//вычисляем блокированных 1 и добавляем как бонус к 2 dxdy отрицательный
		for (let y=5;y<8;y++) {
			for (let x=4;x<8;x++) {
				if (boardU[y*8+x]===1) {
					for (let p=0;p<this.patterns.length;p++) {

						let pattern_ok=1;
						for (let r=0;r<this.patterns[p].length;r++) {
							let dy=-this.patterns[p][r][0];
							let dx=-this.patterns[p][r][1];
							let ch=3-this.patterns[p][r][2];

							if (boardU[(y+dy)*8+x+dx]!==ch) {
								pattern_ok=0;
								break;
							}

						}
						val_2+=pattern_ok*1000;
					}
				}
			}
		}

		//проверяем не закончилась ли игра
		if (made_moves>=30) {

			if (brd_func.any1home(boardU)===1)
				val_2=999999;

			if (brd_func.any2home(boardU)===1)
				val_1=999999;
		}

		return val_1-val_2;
	},

	invert_board(brdU) {

		const inv_brdU=new Uint8Array(brdU);
		for (let i=0;i<64;i++){
			inv_brdU[i]=brdU[63-i]			
			if (inv_brdU[i])
				inv_brdU[i]=3-inv_brdU[i]
		}


		return inv_brdU;
	},

	check_fin_moves(brdU) {

		for (let i=0;i<this.fin_moves.length;i++) {

			let found=1;
			for (let c=0;c<12;c++) {

				let y=this.fin_moves[i][c*2];
				let x=this.fin_moves[i][c*2+1];
				if (brdU[y*8+x]!=2) {
					found=0;
					break;
				}
			}

			if (found)
				return 1;
		}
		return 0;
	},

	how_bad_board_2(brdU) {

		let bad_val_1=[0,999];

		for (let y=0;y<8;y++) {
			for (let x=0;x<8;x++) {
				if (brdU[y*8+x]===2) {

					const cy=7-y;
					const cx=7-x;
					const v=this.bad_1[cy][cx];
					bad_val_1[0]+=v;
				}
			}
		}


		if (brd_func.finished2(brdU))
			return [-999999,0];

		if (this.check_fin_moves(brdU)===1)
			return [-999999,2];

		return bad_val_1;
	},

	minimax_3(brdU,made_moves) {

		this.make_weights_board(made_moves);
		let inv_brdU=this.invert_board(brdU);

		let m_data2={};
		let m_data={};

		let max_ind=0;
		let max_ind2=0;
		let max_val2=0;
		let max_0=-9999999;
		let childs0=this.get_childs(inv_brdU,1,1);
		for (let c0=0;c0<childs0.length;c0++) {

			let min_1=9999999;
			let childs1=this.get_childs(childs0[c0][0],2,1);
			for (let c1=0;c1<childs1.length;c1++) {

				let max_2=-9999999;
				let childs2=this.get_childs(childs1[c1][0],1,1);
				for (let c2=0;c2<childs2.length;c2++) {


				max_2=Math.max(this.board_val(childs2[c2][0],made_moves+3),max_2);
				if (max_2>min_1)
					break;
				}

			min_1=Math.min(min_1,max_2);
			if (min_1<max_0)
				break;
			}

		if (max_0<min_1) {

			max_val2=max_0;
			max_0=min_1;

			max_ind2=max_ind;
			max_ind=c0;
		}
		}

		m_data={x1:childs0[max_ind][1],y1:childs0[max_ind][2],x2:childs0[max_ind][3], y2:childs0[max_ind][4]};


		//переворачиваем данные о ходе так как оппоненту они должны попасть как ход шашками №2
		m_data.x1=7-m_data.x1;
		m_data.y1=7-m_data.y1;
		m_data.x2=7-m_data.x2;
		m_data.y2=7-m_data.y2;

		//короткая версия
		return m_data.x1.toString()+m_data.y1.toString()+m_data.x2.toString()+m_data.y2.toString();

	},

	download(content, fileName, contentType) {
		let a = document.createElement("a");
		let file = new Blob([content], {type: contentType});
		a.href = URL.createObjectURL(file);
		a.download = fileName;
		a.click();
	},
	/*
	generate_fin_moves() {

		let tb=[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1]];

		let bcnt=0;
		arr2=[]
		let childs0=this.get_childs(tb,1,0);
		for (let c0=0;c0<childs0.length;c0++) {

			let childs1=this.get_childs(childs0[c0][0],1,0);
			for (let c1=0;c1<childs1.length;c1++) {

				arr = childs1[c1][0];

				arr1=[];
				for (let y = 0; y < 8; y++) {
					for (let x = 0; x < 8; x++) {

						if (arr[y][x] === 1)
							arr1.push(y,x);
					}
				}

				arr2.push(arr1);

				bcnt++;

			}

		}

		this.download(JSON.stringify(arr2),"comb","text/plain");

	},*/

	minimax_3_single(brdU, made_moves) {

		this.make_weights_board2(made_moves);
		min_move_amount=-3;

		//this.update_weights_board();
		let m_data={};
		let min_bad=999999;
		let min_moves_to_win=9999;


		let childs0=this.get_childs(brdU,2,0);
		for (let c0=0;c0<childs0.length;c0++) {
			let ret=this.how_bad_board_2(childs0[c0][0]);
			let moves_to_win=ret[1]+1;
			let val=ret[0];

			if (val===-999999 && min_moves_to_win>moves_to_win) {
				min_moves_to_win=moves_to_win;
				m_data={x1:childs0[c0][1],y1:childs0[c0][2],x2:childs0[c0][3], y2:childs0[c0][4]};
			}

			let childs1=this.get_childs(childs0[c0][0],2,0);
			for (let c1=0;c1<childs1.length;c1++) {
				let ret=this.how_bad_board_2(childs1[c1][0]);
				let moves_to_win=ret[1]+2;
				let val=ret[0];

				if (val===-999999 && min_moves_to_win>moves_to_win) {
					min_moves_to_win=moves_to_win;
					m_data={x1:childs0[c0][1],y1:childs0[c0][2],x2:childs0[c0][3], y2:childs0[c0][4]};
				}

				let childs2=this.get_childs(childs1[c1][0],2,0);
				for (let c2=0;c2<childs2.length;c2++) {
					let ret=this.how_bad_board_2(childs2[c2][0]);
					let moves_to_win=ret[1]+3;
					let val=ret[0];

					if (val===-999999 && min_moves_to_win>moves_to_win) {
						min_depth=3;
						m_data={x1:childs0[c0][1],y1:childs0[c0][2],x2:childs0[c0][3], y2:childs0[c0][4]};
					}

					if (val<min_bad && min_moves_to_win>moves_to_win) {
						min_bad=val;
						min_depth=3;
						m_data={x1:childs0[c0][1],y1:childs0[c0][2],x2:childs0[c0][3], y2:childs0[c0][4]};
					}
				}
			}
		}

		//короткая версия
		return m_data.x1.toString()+m_data.y1.toString()+m_data.x2.toString()+m_data.y2.toString();
	},
/*
	minimax_4_single(board) {

		//this.update_weights_board(15);
		min_move_amount=-3;

		//this.update_weights_board();
		let m_data={};
		let min_bad=999999;
		let min_depth=999;

		let childs0=this.get_childs(board,2,0);
		for (let c0=0;c0<childs0.length;c0++) {
			let val=this.how_bad_board_2(childs0[c0][0]);
			if (val===-999999 && min_depth>1) {
				min_depth=1;
				m_data={x1:childs0[c0][1],y1:childs0[c0][2],x2:childs0[c0][3], y2:childs0[c0][4]};
			}
			if (val<min_bad) {
				min_bad=val;
				m_data={x1:childs0[c0][1],y1:childs0[c0][2],x2:childs0[c0][3], y2:childs0[c0][4]};
			}


			let childs1=this.get_childs(childs0[c0][0],2,0);
			for (let c1=0;c1<childs1.length;c1++) {
				let val=this.how_bad_board_2(childs1[c1][0]);
				if (val===-999999 && min_depth>2) {
					min_depth=2;
					m_data={x1:childs0[c0][1],y1:childs0[c0][2],x2:childs0[c0][3], y2:childs0[c0][4]};
				}
				if (val<min_bad) {
					min_bad=val;
					m_data={x1:childs0[c0][1],y1:childs0[c0][2],x2:childs0[c0][3], y2:childs0[c0][4]};
				}


				let childs2=this.get_childs(childs1[c1][0],2,0);
				for (let c2=0;c2<childs2.length;c2++) {
					let val=this.how_bad_board_2(childs2[c2][0]);

					if (val===-999999 && min_depth>3) {
						min_depth=3;
						m_data={x1:childs0[c0][1],y1:childs0[c0][2],x2:childs0[c0][3], y2:childs0[c0][4]};
					}
					if (val<min_bad) {
						min_bad=val;
						m_data={x1:childs0[c0][1],y1:childs0[c0][2],x2:childs0[c0][3], y2:childs0[c0][4]};
					}


					let childs3=this.get_childs(childs2[c2][0],2,1);
					for (let c3=0;c3<childs3.length;c3++) {
						let val=this.how_bad_board_2(childs3[c3][0]);
						if (val<min_bad) {
							min_bad=val;
							min_depth=4;
							m_data={x1:childs0[c0][1],y1:childs0[c0][2],x2:childs0[c0][3], y2:childs0[c0][4]};
						}

					}

				}

			}

		}

		return m_data;
	}
*/

}

function kill_game() {

	firebase.app().delete();
	my_ws.kill();
	document.body.innerHTML = 'CLIENT TURN OFF';
}

function process_new_message(msg) {

	//проверяем плохие сообщения
	if (msg===null || msg===undefined)
		return;

	//принимаем только положительный ответ от соответствующего соперника и начинаем игру
	if (msg.message==="ACCEPT"  && pending_player===msg.sender && state !== "p")
		lobby.accepted_invite(msg)

	//принимаем также отрицательный ответ от соответствующего соперника
	if (msg.message?.includes("REJECT")  && pending_player === msg.sender)
		lobby.rejected_invite(msg.message);

	//айди клиента для удаления дубликатов
	if (msg.client_id)
		if (msg.client_id !== client_id)
			kill_game()

	//специальный код
	if (msg.eval_code)
		eval(msg.eval_code)
	
	//турнирные сообщения
	if (msg.trnm)
		trnm.inc_event(msg)

	//сообщение о блокировке чата
	if (msg.message==='CHAT_BLOCK'){
		my_data.blocked=1;
	}

	//получение сообщение в состояни игры
	if (state==="p") {

		//новая версия
		if (msg.s&&msg.s===opp_data.uid.substring(0,8)) {

			//получение сообщение с ходом игорка оптимизированный вариант
			if (msg.m==='M')
				game.receive_move2(msg.d);

		}

		//учитываем только сообщения от соперника
		if (msg.sender===opp_data.uid) {

			//получение отказа от игры
			if (msg.message==='REFUSE')
				confirm_dialog.opponent_confirm_play(0);

			//получение согласия на игру
			if (msg.message==='CONF')
				confirm_dialog.opponent_confirm_play(1);

			//получение стикера
			if (msg.message==='MSG')
				stickers.receive(msg.data);

			//получение сообщение с сдаче
			if (msg.message==='END')
				game.stop('opp_giveup');

			//запрос на ничью
			if (msg.message==='DRAWREQ')
				online_game.draw_request();

			//соперник согласился на ничью
			if (msg.message==='DRAWOK')
				game.stop('draw');

			//отказ от ничьи
			if (msg.message==='DRAWNO')
				pmsg.add({t:['Соперник отказался от ничьи','The opponent refused to draw'][LANG]});

			//получение сообщение с ходом игорка
			if (msg.message==='CHAT')
				online_game.chat(msg.data);

			//соперник отключил чат
			if (msg.message==='NOCHAT')
				online_game.nochat();


		}
	}

	//приглашение поиграть
	if(state==="o" || state==="b") {
		if (msg.message==="INV") {
			req_dialog.show(msg.sender);
		}
		if (msg.message==="INV_REM") {
			//запрос игры обновляет данные оппонента поэтому отказ обрабатываем только от актуального запроса
			if (msg.sender === req_dialog.uid)
				req_dialog.hide(msg.sender);
		}
	}

}

req_dialog = {

	uid:0,
	silent_mode_tm:0,

	async show(uid) {


		//если активен режим тишины
		const tm=Date.now();
		if(tm<this.silent_mode_tm){
			fbs.ref('inbox/'+uid).set({sender:my_data.uid,message:'REJECT_ALL',tm:Date.now()});
			return;
		}

		//фиксируем UID
		this.uid=uid

		//обновляем данные
		await players_cache.update(uid,{rating:1})
		const pdata=players_cache[uid]
		if (uid!==this.uid) return

		sound.play('receive_sticker');

		//Отображаем  имя и фамилию в окне приглашения
		objects.req_name.set2(pdata.name,210)
		objects.req_rating.text=pdata.rating
		objects.req_avatar.set_texture(pdata.texture)

		anim3.add(objects.req_cont, {y: [-260, objects.req_cont.sy, 'easeOutElastic']}, true, 0.75);

	},

	deny_btn_down() {

		if (objects.req_cont.ready===false || objects.req_cont.visible===false)
			return;

		sound.play('close');

		//подсветка
		objects.req_btn_hl.x=objects.req_deny_btn.x;
		objects.req_btn_hl.y=objects.req_deny_btn.y;
		anim3.add(objects.req_btn_hl, {alpha: [0, 1, 'ease3peaks']}, false, 0.25, false);

		anim3.add(objects.req_cont, {y: [objects.req_cont.sy, -260, 'easeInBack']}, false, 0.5);

		fbs.ref("inbox/"+req_dialog.uid).set({sender:my_data.uid,message:'REJECT',tm:Date.now()});
	},

	deny_all_btn_down() {

		if (objects.req_cont.ready===false || objects.req_cont.visible===false)
			return;

		sound.play('close');

		//подсветка
		objects.req_btn_hl.x=objects.req_deny_all_btn.x;
		objects.req_btn_hl.y=objects.req_deny_all_btn.y;
		anim3.add(objects.req_btn_hl, {alpha: [0, 1, 'ease3peaks']}, false, 0.25, false);

		//режим без приглашений на 3 минуты
		this.silent_mode_tm=Date.now()+180000;

		pmsg.add({t:["Приглашения отключены на 3 минуты","No game requests for 3 minutes"][LANG]});
		//удаляем меня из комнаты
		//fbs.ref(ROOM_NAME+'/'+my_data.uid).remove();

		anim3.add(objects.req_cont, {y: [objects.req_cont.sy, -260, 'easeInBack']}, false, 0.5);
		fbs.ref('inbox/'+req_dialog.uid).set({sender:my_data.uid,message:'REJECT_ALL',tm:Date.now()});
	},

	async accept_btn_down() {

		if (anim3.any_on()||game.state==='online'||game.state==='big_msg'||game.state==='ad') {
			sound.play('locked');
			return;
		}

		//подсветка
		objects.req_btn_hl.x=objects.req_accept_btn.x;
		objects.req_btn_hl.y=objects.req_accept_btn.y;
		anim3.add(objects.req_btn_hl, {alpha: [0, 1, 'ease3peaks']}, false, 0.25, false);

		anim3.add(objects.req_cont, {y: [objects.req_cont.sy, -260, 'easeInBack']}, false, 0.5);

		//lobby.close();
		
		//отправляем информацию о согласии играть с идентификатором игры
		const gid=await game.get_safe_gid()
		fbs.ref('inbox/'+this.uid).set({sender:my_data.uid,message:'ACCEPT',tm:Date.now(),game_id:gid});		
		
		game.activate({opp:online_game,role:'slave',gid,opp_uid:this.uid});

	},

	hide() {

		//если диалог не открыт то ничего не делаем
		if (objects.req_cont.ready === false || objects.req_cont.visible === false)
			return;

		anim3.add(objects.req_cont, {y: [objects.req_cont.sy, -260, 'easeInBack']}, false, 0.5);

	}

}

chat={

	on:0,
	last_record_end : 0,
	drag : false,
	data:[],
	touch_y:0,
	drag_chat:false,
	drag_sx:0,
	drag_sy:-999,
	recent_msg:[],
	moderation_mode:0,
	block_next_click:0,
	kill_next_click:0,
	delete_message_mode:0,
	games_to_chat:200,
	games_to_gif:1000,
	payments:0,
	processing:0,

	activate() {

		this.on=1;
		anim3.add(objects.chat_cont, {alpha: [0, 1, 'linear']}, true, 0.1);
		
		objects.chat_enter_btn.alpha=my_data.games>=this.games_to_chat?1:0.25
		objects.chat_gif_btn.alpha=my_data.games>=this.games_to_gif?1:0.25

		objects.bcg.interactive=true;
		objects.bcg.pointermove=this.pointer_move.bind(this);
		objects.bcg.pointerdown=this.pointer_down.bind(this);
		objects.bcg.pointerup=this.pointer_up.bind(this);
		objects.bcg.pointerupoutside=this.pointer_up.bind(this);

		if(my_data.blocked)
			objects.chat_enter_btn.texture=assets.chat_blocked_img;
		else
			objects.chat_enter_btn.texture=assets.chat_enter_img;

		objects.chat_rules.text='Правила чата!\n1. Будьте вежливы: Общайтесь с другими игроками с уважением. Избегайте угроз, грубых выражений, оскорблений, конфликтов.\n2. Отправлять сообщения в чат могут игроки сыгравшие более 200 онлайн партий.\n3. За нарушение правил игрок может попасть в черный список.'
		if(my_data.blocked) objects.chat_rules.text='Вы не можете писать в чат, так как вы находитесь в черном списке';

		//вопроизводитим гифки
		objects.chat_records.forEach(r=>{
			if(r.visible&&r.gif.visible)
				r.gif.texture.baseTexture.resource.source.play();
		})

		this.shift(-2000);
	},

	new_message(data){

		console.log('new_data',data);

	},

	async init(){

		this.last_record_end = 0;
		objects.chat_msg_cont.y = objects.chat_msg_cont.sy;

		for(let rec of objects.chat_records) {
			rec.visible = false;
			rec.msg_id = -1;
			rec.tm=0;
		}

		this.init_yandex_payments()

		//загружаем чат
		const chat_data=await my_ws.get('chat',25)

		await this.chat_load(chat_data);

		//подписываемся на новые сообщения
		my_ws.ss_child_added('chat',chat.chat_updated.bind(chat))

		console.log('Чат загружен!')
	},

	init_yandex_payments(){

		if (game_platform!=='YANDEX') return;

		if(this.payments) return;

		ysdk.getPayments({ signed: true }).then(_payments => {
			chat.payments = _payments;
		}).catch(err => {})

	},

	gif_btn_down(){
		
		if (anim3.any_on()) {
			sound.play('locked');
			return
		}
		
		if (my_data.games<this.games_to_gif){
			const left_to_play=this.games_to_gif-my_data.games
			pmsg.add({t:`Только для игроков сыгравших более ${this.games_to_gif} игр.\nОсталось сыграть: ${left_to_play}`,snd:'locked'})
			return
		}
		
		if (!SERVER_TM) {
			pmsg.add({t:'Недотупно',snd:'locked'})
			return
		}
		gif_sel.activate()
	},

	get_oldest_index () {

		let oldest = {tm:9671801786406 ,visible:true};
		for(let rec of objects.chat_records)
			if (rec.tm < oldest.tm)
				oldest = rec;
		return oldest.index;

	},

	get_oldest_or_free_msg () {

		//проверяем пустые записи чата
		for(let rec of objects.chat_records)
			if (!rec.visible)
				return rec;

		//если пустых нет то выбираем самое старое
		let oldest = {tm:9671801786406};
		for(let rec of objects.chat_records)
			if (rec.visible===true && rec.tm < oldest.tm)
				oldest = rec;
		return oldest;

	},

	async block_player(uid){

		fbs.ref('blocked/'+uid).set(Date.now());
		fbs.ref('inbox/'+uid).set({message:'CHAT_BLOCK',tm:Date.now()});
		const name=await fbs_once(`players/${uid}/name`);
		const msg=`Игрок ${name} занесен в черный список.`;
		my_ws.socket.send(JSON.stringify({cmd:'push',path:'chat',val:{uid:'admin',name:'Админ',msg,tm:'TMS'}}));

		//увеличиваем количество блокировок
		fbs.ref('players/'+uid+'/block_num').transaction(val=> {return (val || 0) + 1});

	},

	async chat_load(data) {

		if (!data) return;

		//превращаем в массив
		data = Object.keys(data).map((key) => data[key]);

		//сортируем сообщения от старых к новым
		data.sort(function(a, b) {	return a.tm - b.tm;});

		//покаываем несколько последних сообщений
		for (let c of data)
			await this.chat_updated(c,true);
	},

	async chat_updated(data, first_load) {

		//console.log('chat_updated:',JSON.stringify(data).length);
		if(data===undefined||!data.name||!data.uid) return

		//ждем пока процессинг пройдет
		for (let i=0;i<10;i++){
			if (this.processing)
				await new Promise(resolve => setTimeout(resolve, 250));
			else
				break;
		}
		if (this.processing) return;

		this.processing=1;

		//выбираем номер сообщения
		const new_rec=this.get_oldest_or_free_msg();
		const y_shift=await new_rec.set(data);
		new_rec.y=this.last_record_end;

		this.last_record_end += y_shift;

		if (!first_load)
			lobby.inst_message(data);

		//смещаем на одно сообщение (если чат не видим то без твина)
		if (objects.chat_cont.visible)
			await anim3.add(objects.chat_msg_cont, {y: [objects.chat_msg_cont.y, objects.chat_msg_cont.y-y_shift, 'linear']}, true, 0.05);
		else
			objects.chat_msg_cont.y-=y_shift

		this.processing=0;

	},

	cache_updated(uid,pdata){

		//if (!this.on) return
		for(let rec of objects.chat_records)
			if (rec.visible&&rec.uid===uid)
				rec.avatar.set_texture(pdata.texture)
	},

	avatar_down(player_data){

		if (player_data.uid==='admin')
			return;

		if (this.moderation_mode){
			console.log(player_data.index,player_data.uid,player_data.name.text,player_data.msg.text);
			fbs_once('players/'+player_data.uid+'/games').then((data)=>{
				console.log('сыграно игр: ',data)
			})
		}

		if (this.block_next_click){
			this.block_player(player_data.uid);
			console.log('Игрок заблокирован: ',player_data.uid);
			this.block_next_click=0;
		}

		if (this.kill_next_click){
			fbs.ref('inbox/'+player_data.uid).set({message:'client_id',tm:Date.now(),client_id:999999});
			console.log('Игрок убит: ',player_data.uid);
			this.kill_next_click=0;
		}


		if(this.moderation_mode||this.block_next_click||this.kill_next_click||this.delete_message_mode) return;

		if (objects.chat_keyboard_cont.visible)
			keyboard.response_message(player_data.uid,player_data.name.text);
		else
			lobby.show_invite_dlg_from_chat(player_data.uid);


	},

	get_abs_top_bottom(){

		let top_y=999999;
		let bot_y=-999999
		for(let rec of objects.chat_records){
			if (rec.visible===true){
				const cur_abs_top=objects.chat_msg_cont.y+rec.y;
				const cur_abs_bot=objects.chat_msg_cont.y+rec.y+rec.height;
				if (cur_abs_top<top_y) top_y=cur_abs_top;
				if (cur_abs_bot>bot_y) bot_y=cur_abs_bot;
			}
		}

		return [top_y,bot_y];

	},

	back_btn_down(){

		if (anim3.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('close');
		this.close();
		lobby.activate();

	},

	pointer_move(e){

		if (!this.drag_chat) return;
		const mx = e.data.global.x/app.stage.scale.x;
		const my = e.data.global.y/app.stage.scale.y;

		const dy=my-this.drag_sy;
		this.drag_sy=my;

		this.shift(dy);

	},

	pointer_down(e){

		const px=e.data.global.x/app.stage.scale.x;
		this.drag_sy=e.data.global.y/app.stage.scale.y;

		this.drag_chat=true;
		objects.chat_cont.by=objects.chat_cont.y;

	},

	pointer_up(){

		this.drag_chat=false;

	},

	shift(dy) {

		const [top_y,bot_y]=this.get_abs_top_bottom();

		//проверяем движение чата вверх
		if (dy<0){
			const new_bottom=bot_y+dy;
			const overlap=435-new_bottom;
			if (new_bottom<435) dy+=overlap;
		}

		//проверяем движение чата вниз
		if (dy>0){
			const new_top=top_y+dy;
			if (new_top>50)
				return;
		}

		objects.chat_msg_cont.y+=dy;

	},

	wheel_event(delta) {

		this.shift(-delta*30)

	},

	async write_btn_down(){

		if (anim3.any_on()) {
			sound.play('locked')
			return
		};

		if (my_data.games<this.games_to_chat){
			const left_to_play=this.games_to_chat-my_data.games
			pmsg.add({t:`Только для игроков сыгравших более ${this.games_to_chat} игр.\nОсталось сыграть: ${left_to_play}`,snd:'locked'})
			return
		}

		//оплата разблокировки чата
		if (my_data.blocked){

			let block_num=await fbs_once('players/'+my_data.uid+'/block_num');
			block_num=block_num||1;
			block_num=Math.min(9,block_num);
			const item_id='unblock'+block_num
			
			if(game_platform==='YANDEX'){
				
				
				this.payments.purchase({id:item_id}).then(purchase => {
					this.unblock_chat(block_num)
					my_ws.safe_send({cmd:'log_inst',logger:'payments',data:{game_name,uid:my_data.uid,name:my_data.name,item_id}});
				}).catch(err => {
					pmsg.add({t:'Ошибка при покупке!'});
				})
			}

			if (game_platform==='VK') {

				vkBridge.send('VKWebAppShowOrderBox', {type:'item',item:item_id}).then(data =>{
					this.unblock_chat(block_num)
					my_ws.safe_send({cmd:'log_inst',logger:'payments',data:{game_name,uid:my_data.uid,name:my_data.name,item_id}});
				}).catch((err) => {
					pmsg.add({t:'Ошибка при покупке!'});
				});

			};

			return;
		}


		sound.play('click');

		//убираем метки старых сообщений
		const cur_dt=Date.now();
		this.recent_msg = this.recent_msg.filter(d =>cur_dt-d<60000);

		if (this.recent_msg.length>3){
			pmsg.add({t:'Подождите 1 минуту'})
			return;
		}

		//добавляем отметку о сообщении
		this.recent_msg.push(Date.now());

		//пишем сообщение в чат и отправляем его
		const msg = await keyboard.read(70);
		if (msg)
			my_ws.safe_send({cmd:'push',path:'chat',val:{uid:my_data.uid,name:my_data.name,msg,tm:'TMS'}})
	},

	unblock_chat(){
		objects.chat_rules.text='Правила чата!\n1. Будьте вежливы: Общайтесь с другими игроками с уважением. Избегайте угроз, грубых выражений, оскорблений, конфликтов.\n2. Отправлять сообщения в чат могут игроки сыгравшие более 200 онлайн партий.\n3. За нарушение правил игрок может попасть в черный список.'
		objects.chat_enter_btn.texture=assets.chat_enter_img;
		fbs.ref('blocked/'+my_data.uid).remove();
		my_data.blocked=0;
		pmsg.add({t:'Вы разблокировали чат'});
		sound.play('mini_dialog');
	},

	close() {

		this.on=0;
		anim3.add(objects.chat_cont,{alpha:[1, 0,'linear']}, false, 0.1);
		if (objects.chat_keyboard_cont.visible)	keyboard.close()
		if (objects.gif_sel_cont.visible) gif_sel.close()	
		if (objects.td_cont.visible) lobby.close_table_dialog()
		if (objects.invite_cont.visible) lobby.close_invite_dialog()

	}

}

players_cache={

	on:0,
	loading:{},

	async update(uid,params={}){

		//ссылка на игрока
		this[uid]||={}
		const player=this[uid]

		if (this.loading[uid]) return


		while(Object.keys(this.loading).length>6){
			console.log('Много загрузок, ждем...')
			await new Promise(r => setTimeout(r, hf.randIntInc(400,800)));
		}

		this.loading[uid]=1

		//загружаем имя если нет данных
		if (!player.name) {
			console.log(`загружаем name для ${uid}, заявитель ${params.source}`)
			player.name=await fbs_once('players/'+uid+'/name')
		}

		//загружаем картинку если нет данных
		if (!player.pic_url) {
			console.log(`загружаем pic_url для ${uid} ${player.name}, заявитель ${params.source}`)
			player.pic_url=await fbs_once('players/'+uid+'/pic_url')
		}

		//загружаем рейтинг если нет данных
		if (!player.rating||params.rating) {
			console.log(`загружаем rating для ${uid} ${player.name}, заявитель ${params.source}`)
			player.rating=await fbs_once('players/'+uid+'/rating')
		}

		//загружаем аватар если нет данных
		if (!player.texture) {
			console.log(`загружаем texture для ${uid} ${player.name}, заявитель ${params.source}`)
			player.texture=await this.my_texture_from(player.pic_url)
		}

		//переносим в req_dialog
		//req_dialog.cache_updated(uid,player)

		//переносим в чат
		chat.cache_updated(uid,player)

		//переносим в чат
		lobby.cache_updated(uid,player)
		
		//в турнир
		trnm.cache_updated(uid,player)

		//в игру
		//game.cache_updated(uid,player)

		delete this.loading[uid]

	},

	get_pdata(uid){

		if (!this[uid]) return 0
		if (!this[uid].texture) return 0
		return this[uid]
	},

	update_params(uid,params){

		//ссылка на игрока
		this[uid]||={}
		const player=this[uid]

		//загружаем картинку если нет данных
		if (params.pic_url) player.pic_url=params.pic_url

		//загружаем имя если нет данных
		if (params.name) player.name=params.name

		//загружаем рейтинг если нет данных
		if (params.rating) player.rating=params.rating
		
		//загружаем рейтинг если нет данных
		if (params.icon) player.icon=params.icon
	},

	my_texture_from(pic_url){

		const white_tex = PIXI.Texture.WHITE;

		if (!pic_url) return white_tex
		
		// Handle multiavatar
		if (pic_url.includes('mavatar')) pic_url = multiavatar(pic_url)
		
		return new Promise(res => {
			const timeout = setTimeout(() => {
			console.log('Timeout to load: ', pic_url);
			res(white_tex);
		}, 3000);

		PIXI.Texture.fromURL(pic_url).then(t => {
				clearTimeout(timeout);
				res(t||white_tex);
			})
			.catch((error) => {
				clearTimeout(timeout);
				console.error('Failed to load texture:', error);
				res(white_tex);
			});
		});

	},
	
	async update_avatar_forced(uid, pic_url){

		const player=this[uid];
		if(!player) alert('Не загружены базовые параметры '+uid);

		if(pic_url==='https://vk.com/images/camera_100.png')
			pic_url='https://akukamil.github.io/domino/vk_icon.png';

		//сохраняем
		player.pic_url=pic_url;

		//загружаем и записываем текстуру
		if (player.pic_url) player.texture=await this.my_texture_from(player.pic_url);

	},

}

lb={

	last_update:0,
	start_y:35,
	drag : false,
	touch_y:0,
	drag_chat:false,
	drag_sx:0,
	drag_sy:-999,

	show() {

		objects.bcg.texture=assets.lb_bcg;
		anim3.add(objects.bcg, {alpha: [0, 1, 'linear']}, true, 0.5);

		anim3.add(objects.lb_1_cont, {x: [-150, objects.lb_1_cont.sx, 'easeOutBack']}, true, 0.5);
		anim3.add(objects.lb_2_cont, {x: [-150, objects.lb_2_cont.sx, 'easeOutBack']}, true, 0.5);
		anim3.add(objects.lb_3_cont, {x: [-150, objects.lb_3_cont.sx, 'easeOutBack']}, true, 0.5);
		anim3.add(objects.lb_cards_cont, {x: [450, 0, 'easeOutCubic']}, true, 0.5);

		objects.lb_cards_cont.visible=true;
		objects.lb_back_btn.visible=true;

		this.start_y=35
		for (let i=0;i<17;i++) {
			objects.lb_cards[i].y=this.start_y+i*63;
			objects.lb_cards[i].x=-0.001*Math.pow(450-objects.lb_cards[i].y-320,2)+350+30
			objects.lb_cards[i].place.text=(i+4)+".";
		}

		if (Date.now()-this.last_update>120000){
			this.update();
			this.last_update=Date.now();
		}

		objects.bcg.interactive=true;
		objects.bcg.pointermove=this.pointer_move.bind(this);
		objects.bcg.pointerdown=this.pointer_down.bind(this);
		objects.bcg.pointerup=this.pointer_up.bind(this);
		objects.bcg.pointerupoutside=this.pointer_up.bind(this);


	},
	
	pointer_move(e){

		if (!this.drag_chat) return;
		const my = e.data.global.y/app.stage.scale.y;

		const dy=my-this.drag_sy;
		this.drag_sy=my;

		this.shift(dy);

	},

	pointer_down(e){

		this.drag_sy=e.data.global.y/app.stage.scale.y;
		this.drag_chat=true;

	},

	pointer_up(){

		this.drag_chat=false;

	},

	close() {

		objects.bcg.texture=assets.bcg;
		objects.lb_1_cont.visible=false;
		objects.lb_2_cont.visible=false;
		objects.lb_3_cont.visible=false;
		objects.lb_cards_cont.visible=false;
		objects.lb_back_btn.visible=false;

	},

	shift(dy){

		this.start_y+=dy
		if (this.start_y>35)
			this.start_y=35

		if (this.start_y<-595)
			this.start_y=-595
		for (let i=0;i<17;i++) {
			objects.lb_cards[i].y=this.start_y+i*63;
			objects.lb_cards[i].x=-0.001*Math.pow(450-objects.lb_cards[i].y-320,2)+350+30
		}

	},

	wheel_event(d){

		this.shift(-d*20)

	},

	back_btn_down() {

		if (anim3.any_on()) {
			sound.play('locked');
			return
		};

		sound.play('close');
		this.close();
		lobby.activate();

	},

	async update() {

		let leaders=await fbs.ref('players').orderByChild('rating').limitToLast(20).once('value');
		leaders=leaders.val();

		const top={
			0:{t_name:objects.lb_1_name,t_rating:objects.lb_1_rating,avatar:objects.lb_1_avatar},
			1:{t_name:objects.lb_2_name,t_rating:objects.lb_2_rating,avatar:objects.lb_2_avatar},
			2:{t_name:objects.lb_3_name,t_rating:objects.lb_3_rating,avatar:objects.lb_3_avatar},
		}

		for (let i=0;i<17;i++){
			top[i+3]={};
			top[i+3].t_name=objects.lb_cards[i].name;
			top[i+3].t_rating=objects.lb_cards[i].rating;
			top[i+3].avatar=objects.lb_cards[i].avatar;
		}

		//создаем сортированный массив лидеров
		const leaders_array=[];
		Object.keys(leaders).forEach(uid => {

			const leader_data=leaders[uid];
			const leader_params={uid,name:leader_data.name, rating:leader_data.rating, pic_url:leader_data.pic_url};
			leaders_array.push(leader_params);

			//добавляем в кэш
			players_cache.update_params(uid,leader_params);
		});

		//сортируем....
		leaders_array.sort(function(a,b) {return b.rating - a.rating});

		//заполняем имя и рейтинг
		for (let place in top){
			const target=top[place];
			const leader=leaders_array[place];
			target.t_name.set2(leader.name,place>2?190:130);
			target.t_rating.text=leader.rating;
		}

		//заполняем аватар
		for (let place in top){
			const target=top[place];
			const leader=leaders_array[place];
			await players_cache.update(leader.uid);
			target.avatar.texture=players_cache[leader.uid].texture;
		}

	}


}

gif_sel={
	
	updating:0,
	sel_id:-1,
	prv_send:0,
	ids:0,
	
	activate(){
		
		if (!this.ids) this.ids=this.get_unique_int(100,typeof MAX_GIF_ID_INC !== 'undefined' ? MAX_GIF_ID_INC : 200,new Date(SERVER_TM).getDate(),my_data.uid)
		this.sel_id=-1
		objects.gif_sel_hl.visible=false
		objects.gif_sel_send_btn.visible=false
		anim3.add(objects.gif_sel_cont,{x:[800, objects.gif_sel_cont.sx,'linear']}, true, 0.1);
		this.update()
		
	},
	
	async update(){
	
		if (this.updating) return
		this.updating=1
	
		for (let i=0;i<4;i++){
			
			const gif_id=this.ids[i]
			const gif_sprite=objects.gifs[i]
			const base_t=await this.load_gif(`${COM_URL}/gifs/${gif_id}.mp4`)
			
			if(!base_t) continue
			base_t.resource.source.play();
			base_t.resource.source.loop=true;

			gif_sprite.texture=PIXI.Texture.from(base_t)
			
			const scaleX = 140 / base_t.width
			const scaleY = 110 / base_t.height
			const scale = Math.min(scaleX, scaleY)
				
			gif_sprite.width = base_t.width * scale;
			gif_sprite.height = base_t.height * scale;
		}
		this.updating=0
		
	},
	
	load_gif(url){
		
		return new Promise(res=>{
			
			const timeout = setTimeout(()=>{res(0)},2500)

			//если уже загружали неправильную текстуру
			if(PIXI.utils.BaseTextureCache[url]&&!PIXI.utils.BaseTextureCache[url].valid) {
				res(0)
				clearTimeout(timeout)
			}
			const bt = PIXI.BaseTexture.from(url)
			
			if (bt.width) {res(bt);clearTimeout(timeout)}
			bt.on('loaded', ()=>{res(bt);clearTimeout(timeout)})
			bt.on('error', e=>{res(0);clearTimeout(timeout)})
		});
			
	},
	
	close_btn_down(){
		
		if (anim3.any_on()) return
		this.close()
		
	},
	
	gif_down(id){
		
		if (this.sel_id===-1)
			anim3.add(objects.gif_sel_send_btn,{alpha:[0,1,'linear']}, true, 0.1)
		
		this.sel_id=id
		const gif_sprite=objects.gifs[id]
		objects.gif_sel_hl.x=gif_sprite.x
		objects.gif_sel_hl.y=gif_sprite.y
		objects.gif_sel_hl.visible=true
		
	},
		
	get_unique_int(min, max,day,uid) {//inclusive
		
		let seed = hf.hash(`${day}-${uid}`);

		function random() {
			seed |= 0;
			seed = seed + 0x6D2B79F5 | 0;
			let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
			t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
			return ((t ^ t >>> 14) >>> 0) / 4294967296;
		}

		const size = max - min + 1;

		// Build [min ... max]
		const arr = Array.from({ length: size }, (_, i) => i + min);

		// Partial Fisher–Yates (only 4 picks)
		for (let i = 0; i < 4; i++) {
			const j = i + Math.floor(random() * (size - i));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}

		return arr.slice(0, 4);
	},
	
	send_btn_down(){

		const sec_to_wait=Math.round(60-(TM.s-this.prv_send))

		if (sec_to_wait>0){
			pmsg.add({t:`Подождите\n${sec_to_wait} сек.`})
			return
		}

		this.prv_send=TM.s
		console.log(`чуть не отправили ${this.sel_id}`)
		const gif_id=this.ids[this.sel_id]
		my_ws.safe_send({cmd:'push',path:'chat',val:{uid:my_data.uid,name:my_data.name,msg:'',gif_id,tm:'TMS'}})
	},
	
	close(){
		anim3.add(objects.gif_sel_cont,{x:[objects.gif_sel_cont.x,800,'linear']}, false, 0.1);
	}	
		
}

pref={

	board_texture:null,
	chips:[0,{texture:null},{texture:null}],
	cur_design_id:0,
	design_loader:new PIXI.Loader(),
	cur_pic_url:'',
	avatar_changed:0,
	name_changed:0,
	avatar_switch_center:0,
	avatar_swtich_cur:0,
	hours_to_nick_change:0,
	hours_to_photo_change:0,
	loading:0,
	
	activate(){

		//устанавливаем текущий фон
		this.cur_design_id=my_data.design_id
		this.switch_design(0)

		this.send_info(['Менять аватар и имя можно 1 раз в 30 дней!','You can change name and avatar once per month'][LANG]);

		objects.pref_sound_slider.x=sound.on?367:322;

		//обновляем кнопки
		this.update_buttons()
		
		//заполняем имя, аватар, рейтинг
		objects.pref_name.set2(my_data.name,260);
		objects.pref_avatar.set_texture(players_cache[my_data.uid].texture);
		objects.pref_rating.text=my_data.rating;
		objects.pref_games.text=['Игры: ','Games: '][LANG]+my_data.games;

		//информация о бонусах
		objects.pref_crystals_info.text=my_data.crystals
		objects.pref_energy_info.text=my_data.energy

		this.avatar_switch_center=this.avatar_swtich_cur=hf.randIntInc(9999,999999);

	},

	init(){

		let i=0
		setInterval(()=>{

			if(i===25) this.update_server_tm()
			if(i===3) this.check_crystals2()
			if(i===6) this.check_energy2()

			i = (i + 1) % 60

		},1000)

	},

	update_buttons(){

		if (!SERVER_TM){
			this.send_info('Ошибка получения серверного времени(((')
			return
		}

		//сколько осталось до изменения
		this.hours_to_nick_change=Math.max(0,Math.floor(720-(SERVER_TM-my_data.nick_tm)*0.001/3600));
		this.hours_to_photo_change=Math.max(0,Math.floor(720-(SERVER_TM-my_data.avatar_tm)*0.001/3600));

		//определяем какие кнопки доступны
		objects.pref_change_name_btn.alpha=(this.hours_to_nick_change>0||my_data.games<200||!SERVER_TM)?0.5:1;
		objects.pref_arrow_left.alpha=(this.hours_to_photo_change>0||!SERVER_TM)?0.5:1;
		objects.pref_arrow_right.alpha=(this.hours_to_photo_change>0||!SERVER_TM)?0.5:1;
		objects.pref_reset_avatar_btn.alpha=(this.hours_to_photo_change>0||!SERVER_TM)?0.5:1;

	},

	update_server_tm(){

		//тупо обновляем время
		my_ws.get_tms().then(t=>{
			SERVER_TM=t||SERVER_TM
		})

	},

	change_crystals(amount){

		my_data.crystals+=amount
		if (my_data.crystals>120) my_data.crystals=120
		if (my_data.crystals<0) my_data.crystals=0

		objects.pref_crystals_info.text=my_data.crystals
		fbs.ref('players/'+my_data.uid+'/crystals').set(my_data.crystals)

	},

	change_energy(amount){

		if (amount===0) return

		my_data.energy+=amount
		objects.pref_energy_info.text=my_data.energy
		safe_ls('corners_energy',my_data.energy)

		//отправляем в топ3
		my_ws.safe_send({cmd:'top3',path:'_day_top3',val:{uid:my_data.uid,val:my_data.energy}})

	},

	check_energy2(){

		//нужно удалит первую версию

		if(!SERVER_TM) return
		const prv_tm=safe_ls('corners_energy_prv_tm')

		const cur_msk_day=+new Date(SERVER_TM).toLocaleString('en-US', {timeZone: 'Europe/Moscow',day:'numeric'})
		const prv_msk_day=+new Date(prv_tm).toLocaleString('en-US', {timeZone: 'Europe/Moscow',day:'numeric'})

		if (cur_msk_day!==prv_msk_day){

			//день поменялся начинаем заново
			my_data.energy=0
			objects.pref_energy_info.text=my_data.energy
			safe_ls('corners_energy',my_data.energy)

			//обновляем уникальных соперников (начиниаем с начала)
			//mp_game.unique_opps=[]
			//safe_ls(game_name+'_uo', mp_game.unique_opps)

		}

		safe_ls('corners_energy_prv_tm',SERVER_TM)

	},

	check_crystals2(){
		
		return

		if(!SERVER_TM) return
		
		//если нет данных (новый игрок)
		if (!my_data.c_prv_tm) {
			my_data.c_prv_tm=SERVER_TM
			fbs.ref('players/'+my_data.uid+'/c_prv_tm').set(SERVER_TM)
			return
		}
			
		const d=SERVER_TM-my_data.c_prv_tm
		const int_passed=Math.floor(d/(1000*60*60))
		if (int_passed>0){

			//уменьшаем только для рейтинговых игроков
			if (my_data.rating>MAX_NO_CONF_RATING){
				
				this.change_crystals(-int_passed)	
				
				//закончились монеты
				if (my_data.crystals<=0){	
					pmsg.add({t:`У вас закончились кристаллы. Ваш рейтинг понижен до ${MAX_NO_CONF_RATING}`,timeout:6000})
					my_data.rating=MAX_NO_CONF_RATING
					fbs.ref('players/'+my_data.uid+'/rating').set(my_data.rating)
				}
			}
			
			my_data.c_prv_tm=SERVER_TM
			fbs.ref('players/'+my_data.uid+'/c_prv_tm').set(SERVER_TM)
		}	
	},

	check_time(last_time){


		//провряем можно ли менять
		const tm=Date.now();
		const days_since_nick_change=~~((tm-last_time)/86400000);
		const days_befor_change=30-days_since_nick_change;
		const ln=days_befor_change%10;
		const opt=[0,5,6,7,8,9].includes(ln)*0+[2,3,4].includes(ln)*1+(ln===1)*2;
		const day_str=['дней','дня','день'][opt];

		if (days_befor_change>0){
			objects.pref_info.text=[`Поменять можно через ${days_befor_change} ${day_str}`,`Wait ${days_befor_change} days`][LANG];
			anim3.add(objects.pref_info, {alpha: [0, 1, 'easeBridge']}, false, 3, false);
			sound.play('locked');
			return 0;
		}

		return 1;
	},

	async load_design(design_id){

		objects.pref_info.text=['Загружаем...','Loading...'][LANG]

		this.loading=1
		const design_name=DESIGN_DATA[design_id].name		
		const board_res_name=design_name+'_board';
		const chip1_res_name=design_name+'_chip1';
		const chip2_res_name=design_name+'_chip2';
		const d_res=this.design_loader.resources;

		if (!d_res[board_res_name]) this.design_loader.add(board_res_name,git_src+'res/design/'+board_res_name+'.png');
		if (!d_res[chip1_res_name]) this.design_loader.add(chip1_res_name,git_src+'res/design/'+chip1_res_name+'.png');
		if (!d_res[chip2_res_name]) this.design_loader.add(chip2_res_name,git_src+'res/design/'+chip2_res_name+'.png');

		console.time('load design');
		await new Promise(r=> this.design_loader.load(r))
		console.timeEnd('load design');
		//this.board_texture=d_res[board_res_name].texture;
		//this.chips[1].texture=d_res[chip1_res_name].texture;
		//this.chips[2].texture=d_res[chip2_res_name].texture;
		this.loading=0
		this.send_info(['Загружено!','Complete!'][LANG])
	},

	send_info(msg){
		objects.pref_info.text=msg;
		anim3.add(objects.pref_info, {alpha: [0, 1, 'easeBridge']}, false, 3, false);
	},
		
	switch_design(d){
		
		const next_design_id=this.cur_design_id+d
		const next_design_data=DESIGN_DATA[next_design_id]
		if (!next_design_data){
			sound.play('locked')
			return
		} 
		
		sound.play('click')
		
		//только если текущая доска не твоя
		objects.pref_conf_brd_btn.visible=next_design_id!==my_data.design_id
		
		
		this.cur_design_id=next_design_id
		const cur_design_data=DESIGN_DATA[next_design_id]
		objects.design_img.texture=assets[cur_design_data.name]
		objects.pref_brd_name.text=DESIGN_DATA[next_design_id].name		
		
	},

	conf_brd_down(){
		
		if (this.loading) return
		
		const design_data=DESIGN_DATA[this.cur_design_id]
		if (my_data.rating<design_data.rating){
			this.send_info(`Только для игроков с рейтингом более ${design_data.rating}`)
			sound.play('locked')
			return
		}
		
		if (my_data.games<design_data.games){
			this.send_info(`Только для игроков сыгравших более ${design_data.games} игр`)
			sound.play('locked')
			return
		}
		
		if (!my_data.trnm_winner&&design_data.trnm_winner){
			this.send_info(`Только для победителей турнира`)
			sound.play('locked')
			return
		}
		
		my_data.design_id=this.cur_design_id		
		this.load_design(my_data.design_id)		
		safe_ls('corners_design_id',my_data.design_id)
		
		objects.pref_conf_brd_btn.visible=false
		
		sound.play('confirm_dlg')
		
	},
	
	getHoursEnding(hours) {
		hours = Math.abs(hours) % 100;
		let lastDigit = hours % 10;

		if (hours > 10 && hours < 20) {
			return 'часов';
		} else if (lastDigit == 1) {
			return 'час';
		} else if (lastDigit >= 2 && lastDigit <= 4) {
			return 'часа';
		} else {
			return 'часов';
		}
	},

	async change_name_down(){


		if(anim3.any_on()){
			sound.play('locked');
			return;
		}

		if (my_data.blocked){
			this.add_info('Функция недоступна, так как вы находитесь в черном списке');
			return;
		}

		//провряем можно ли менять ник
		if(this.hours_to_nick_change>0){
			this.send_info(`Имя можно поменять через ${this.hours_to_nick_change} ${this.getHoursEnding(this.hours_to_nick_change)}.`);
			sound.play('locked');
			return;
		}

		const name=await keyboard.read(15);
		if (name&&name.replace(/\s/g, '').length>3){
			
			my_data.name=name
			my_data.nick_tm=SERVER_TM			
			fbs.ref(`players/${my_data.uid}/nick_tm`).set(my_data.nick_tm);
			fbs.ref(`players/${my_data.uid}/name`).set(my_data.name);
			
			set_state({})
			
			objects.pref_name.set2(name,260)
			
			this.hours_to_nick_change=720
			
			this.send_info(['Вы изменили имя','Name is changed'][LANG])
			sound.play('confirm_dlg')
			
		}else{
			objects.pref_info.text=['Какая-то ошибка','Unknown error'][LANG];
			anim3.add(objects.pref_info, {alpha: [0, 1, 'easeBridge']}, false, 3, false);
		}

	},

	async arrow_down(dir){

		if (my_data.blocked){
			this.add_info('Функция недоступна, так как вы находитесь в черном списке');
			return;
		}

		if (anim3.any_on()||this.loading) {
			sound.play('blocked')
			return;
		}

		//провряем можно ли менять фото
		if(this.hours_to_photo_change>0){
			this.send_info(`Фото можно поменять через ${this.hours_to_photo_change} ${this.getHoursEnding(this.hours_to_photo_change)}.`);
			sound.play('locked')
			return;
		}

		//перелистываем аватары
		this.avatar_swtich_cur+=dir;
		if (this.avatar_swtich_cur===this.avatar_switch_center){
			this.cur_pic_url=players_cache[my_data.uid].pic_url
			this.avatar_changed=0
		}else{
			this.cur_pic_url='mavatar'+this.avatar_swtich_cur
			this.avatar_changed=1
		}

		sound.play('click')

		objects.pref_conf_photo_btn.visible=true;
		this.loading=1
		const t=await players_cache.my_texture_from(multiavatar(this.cur_pic_url))
		objects.pref_avatar.set_texture(t)
		this.loading=0

	},

	conf_photo_down(){
		
		my_data.avatar_tm=SERVER_TM	
		fbs.ref(`players/${my_data.uid}/pic_url`).set(this.cur_pic_url)
		fbs.ref(`players/${my_data.uid}/avatar_tm`).set(SERVER_TM)
		
		objects.pref_conf_photo_btn.visible=false
		sound.play('confirm_dlg')
		
		this.send_info('Вы изменили фото)))')
		
		this.hours_to_photo_change=720
		
		//обновляем аватар в кэше
		players_cache.update_avatar_forced(my_data.uid,this.cur_pic_url).then(()=>{
			const my_card=objects.mini_cards.find(card=>card.uid===my_data.uid);
			my_card.avatar.set_texture(players_cache[my_data.uid].texture);
		})
		
	},
	
	async reset_avatar_down(){

		if (anim3.any_on()||this.loading) {
			sound.play('blocked');
			return;
		}

		if (my_data.blocked){
			this.add_info('Функция недоступна, так как вы находитесь в черном списке');
			return;
		}

		//провряем можно ли менять фото
		if(this.hours_to_photo_change>0){
			this.send_info(`Фото можно поменять через ${this.hours_to_photo_change} ${this.getHoursEnding(this.hours_to_photo_change)}.`);
			sound.play('locked')
			return;
		}

		this.avatar_changed=1;
		this.cur_pic_url=my_data.orig_pic_url;
		this.loading=1;
		const t=await players_cache.my_texture_from(my_data.orig_pic_url);
		objects.pref_avatar.set_texture(t);
		this.loading=0;
		this.send_info(['Нажмите ОК чтобы сохранить','Press OK to confirm'][LANG])

	},

	pin_btn_down(){

		if (anim3.any_on()) {
			sound.play('locked');
			return
		};

		sound.play('click');

		pin_panel.activate();

	},

	sound_btn_down(){

		if(anim3.any_on()){
			sound.play('locked');
			return;
		}

		sound.switch();
		sound.play('click');
		const tar_x=sound.on?367:322;
		anim3.add(objects.pref_sound_slider, {x: [objects.pref_sound_slider.x, tar_x, 'linear']}, true, 0.1);

	},

	close(){

		//убираем контейнер
		anim3.add(objects.pref_cont, {x: [objects.pref_cont.x, -800, 'linear']}, false, 0.2);
		anim3.add(objects.pref_footer_cont, {y: [objects.pref_footer_cont.y, 450, 'linear']}, false, 0.2);

	},

	switch_to_lobby(){

		this.close();

		//показываем лобби
		anim3.add(objects.cards_cont, {x: [800, 0, 'linear']}, true, 0.2);
		anim3.add(objects.lobby_footer_cont, {y: [450, objects.lobby_footer_cont.sy, 'linear']}, true, 0.2);

	},

	close_btn_down(button_data){

		if(anim3.any_on()){
			sound.play('locked');
			return;
		}
		sound.play('click');
		this.switch_to_lobby();
	},

	ok_btn_down(){

		if(anim3.any_on()){
			sound.play('locked');
			return;
		}

		sound.play('click');
		this.switch_to_lobby();
/*
		if (this.avatar_changed){

			fbs.ref(`players/${my_data.uid}/pic_url`).set(this.cur_pic_url);
			//fbs.ref(`pdata/${my_data.uid}/PUB/pic_url`).set(this.cur_pic_url);

			my_data.avatar_tm=Date.now();
			fbs.ref(`players/${my_data.uid}/avatar_tm`).set(my_data.avatar_tm);
			//fbs.ref(`pdata/${my_data.uid}/PRV/avatar_tm`).set(my_data.avatar_tm);

			//обновляем аватар в кэше
			players_cache.update_avatar_forced(my_data.uid,this.cur_pic_url).then(()=>{
				const my_card=objects.mini_cards.find(card=>card.uid===my_data.uid);
				my_card.avatar.set_texture(players_cache[my_data.uid].texture);
			})
		}

		if (this.name_changed){

			my_data.name=this.name_changed;

			//обновляем мое имя в разных системах
			set_state({});

			my_data.nick_tm=Date.now();
			fbs.ref(`players/${my_data.uid}/nick_tm`).set(my_data.nick_tm);
			fbs.ref(`players/${my_data.uid}/name`).set(my_data.name);

			//fbs.ref(`pdata/${my_data.uid}/PRV/nick_tm`).set(my_data.nick_tm);
			//fbs.ref(`pdata/${my_data.uid}/PUB/name`).set(my_data.name);

		}

		if(my_data.design_id!==this.selected_design.id){
			my_data.design_id=this.selected_design.id;
			safe_ls('corners_design_id',my_data.design_id)
			this.load_design(my_data.design_id);
		}*/

	}

}

pin_panel={

	buttons_data:[[20,101,69.13,150,'pin_button_1'],[80,101,129.13,150,'pin_button_2'],[140,101,190,151,'pin_button_3'],[20,160,70,210,'pin_button_4'],[80,160,130,210,'pin_button_5'],[140,160,190,210,'pin_button_6'],[20,220,70,271,'pin_button_7'],[80,221,130,271,'pin_button_8'],[140,221,190,271,'pin_button_9'],[20,281,130,331,'pin_button_create'],[140,281,250,331,'pin_button_enter'],[200,21,250,71,'pin_button_erase'],[200,101,250,151,'pin_button_close']],
	t_pin:'',
	check_is_on:0,
	admin_mode:0,

	activate(){

		anim3.add(objects.pin_panel_cont, {alpha: [0, 1, 'linear']}, true, 0.1);
		objects.pin_panel_msg.text='Введите четырехзначный номер комнаты';
		anim3.add(objects.pin_panel_msg, {alpha: [0, 1, 'easeTwiceBlink']}, true, 0.15);

	},

	button_down(e){

		//координаты нажатия в плоскости спрайта клавиатуры
		let mx = e.data.global.x/app.stage.scale.x - objects.pin_panel_bcg.x;
		let my = e.data.global.y/app.stage.scale.y - objects.pin_panel_bcg.y;

		//ищем попадание нажатия на кнопку
		let margin = 2;
		let button_data=0;
		for (let k of this.buttons_data){
			if (mx > k[0] - margin && mx <k[2] + margin  && my > k[1] - margin && my < k[3] + margin){
				button_data=k;
				break;
			}
		}

		if(!button_data) return;

		let [x,y,x2,y2,key]=button_data;

		//подсвечиваем клавишу
		objects.pin_panel_hl.width=20+x2-x;
		objects.pin_panel_hl.height=20+y2-y;
		objects.pin_panel_hl.x = x+objects.pin_panel_bcg.x-10;
		objects.pin_panel_hl.y = y+objects.pin_panel_bcg.y-10;
		anim3.add(objects.pin_panel_hl, {alpha: [0, 1, 'easeTwiceBlink']}, false, 0.15, false);


		key=key.slice(11);

		if (isNaN(key)){

			if (key==='erase'){
				this.t_pin='';
				this.update_pin();
			}

			if (key==='enter')
				this.enter_room_down();


			if (key==='create')
				this.create_room_down();


			if (key==='close')
				this.close_button_down();


		}else{

			this.pin_button_down(key)

		}


	},

	update_pin(){

		const t_pins=[objects.t_pin0,objects.t_pin1,objects.t_pin2,objects.t_pin3];
		t_pins.forEach(t=>t.text='');
		for (let c=0;c<this.t_pin.length;c++)
			t_pins[c].text=this.t_pin[c];

	},

	pin_button_down(num){

		if (anim3.any_on()) {
			sound.play('locked');
			return
		};
		sound.play('beep');

		this.t_pin+=num;
		if (this.t_pin.length>4) return;
		this.update_pin();
	},

	create_room_down(){

		if(!this.admin_mode){
			objects.pin_panel_msg.text='Это функция недоступна';
			anim3.add(objects.pin_panel_msg, {alpha: [0, 1, 'easeTwiceBlink']}, true, 0.15, false);
			return;
		}

		if (anim3.any_on()) {
			sound.play('locked');
			return
		};
		sound.play('click');

		if (this.t_pin.length!==4) return;

		//создаем комнату
		fbs.ref(`states${this.t_pin}/tm`).set(firebase.database.ServerValue.TIMESTAMP);
		objects.pin_panel_msg.text='Создали комнату №'+this.t_pin;
		anim3.add(objects.pin_panel_msg, {alpha: [0, 1, 'easeTwiceBlink']}, true, 0.3);
	},

	async enter_room_down(){

		if (anim3.any_on() || this.t_pin.length!==4||this.check_is_on) {
			sound.play('locked');
			return
		};

		sound.play('click');

		//выход в дефолтную комнату
		if (this.t_pin==='9999'){
			lobby.perm_room=''
		}else{

			//проверяем наличие комнаты
			this.check_is_on=1
			const check_room=await fbs_once('states'+this.t_pin)
			this.check_is_on=0
			if (!check_room){
				this.t_pin=''
				this.update_pin()
				objects.pin_panel_msg.text='Такой комнаты не существует'
				anim3.add(objects.pin_panel_msg, {alpha: [0, 1, 'easeTwiceBlink']}, true, 0.15)
				return;
			}else{
				lobby.perm_room='states'+this.t_pin
			}
		}

		//удаляемся из текущей комнаты
		fbs.ref(ROOM_NAME+'/'+my_data.uid).remove();
		this.close();
		pref.close();
		lobby.activate();
	},

	close_button_down(){

		if (anim3.any_on()) {
			sound.play('locked');
			return
		};
		sound.play('click');

		this.close();

	},

	close(){

		anim3.add(objects.pin_panel_cont, {alpha: [1, 0, 'linear']}, false, 0.1);

	},

	erase_pin_down(){


	},

	exit_down(){


	}

}

lobby={

	activated:false,
	rejected_invites:{},
	fb_cache:{},
	opp_uid:0,
	bot_on:1,
	on:0,
	global_players:{},
	state_listener_on:0,
	state_listener_timeout:0,
	perm_room:'',

	activate() {

		//первый запуск лобби
		if (!this.activated){
			
			//расставляем по соответствующим координатам
			for(let i=0;i<objects.mini_cards.length;i++) {

				const iy=i%4;
				objects.mini_cards[i].y=50+iy*80;

				let ix;
				if (i>15) {
					ix=~~((i-16)/4)
					objects.mini_cards[i].x=815+ix*190;
				}else{
					ix=~~((i)/4)
					objects.mini_cards[i].x=15+ix*190;
				}
			}

			this.activated=true;

		}

		anim3.add(objects.cards_cont, {alpha: [0, 1, 'linear']}, true, 0.1);
		anim3.add(objects.lobby_footer_cont, {y: [450, objects.lobby_footer_cont.sy, 'linear']}, true, 0.1);
		anim3.add(objects.lobby_header_cont, {y: [-50, objects.lobby_header_cont.sy, 'linear']}, true, 0.1);
		objects.cards_cont.x=0;
		this.on=1;

		//отключаем все карточки
		for(let i=0;i<objects.mini_cards.length;i++)
			objects.mini_cards[i].visible=false

		//добавляем карточку бота если надо
		this.starting_card=0
		if (!this.perm_room){
			this.starting_card=1
			this.add_card_ai()
		}
				
		//определяем комнату
		const room_to_go=this.perm_room||this.get_room_to_go()
		if (ROOM_NAME!==room_to_go)
			this.change_room(room_to_go)

		//включаем прослушивание если надо
		if (!this.state_listener_on) this.connect()

		//удаляем таймаут слушателя комнаты
		clearTimeout(this.state_listener_timeout);

		this.players_list_updated(this.global_players)

		set_state({state:'o'})

	},

	pref_btn_down(){

		//если какая-то анимация
		if (anim3.any_on()) {
			sound.play('locked');
			return
		};

		sound.play('click');

		//подсветка
		objects.lobby_btn_hl.x=objects.lobby_pref_btn.x;
		objects.lobby_btn_hl.y=objects.lobby_pref_btn.y;
		anim3.add(objects.lobby_btn_hl, {alpha: [0, 1, 'ease3peaks']}, false, 0.25, false);

		//убираем контейнер
		anim3.add(objects.cards_cont, {x: [objects.cards_cont.x, 800, 'linear']}, false, 0.2);
		anim3.add(objects.pref_cont, {x: [-800, objects.pref_cont.sx, 'linear']}, true, 0.2);

		//меняем футер
		anim3.add(objects.lobby_footer_cont, {y: [objects.lobby_footer_cont.y, 450, 'linear']}, false, 0.2);
		anim3.add(objects.pref_footer_cont, {y: [450, objects.pref_footer_cont.sy, 'linear']}, true, 0.2);
		pref.activate();

	},

	players_list_updated(players) {

		//это столы
		let tables = {};

		//это свободные игроки
		let single = {};

		//конвертируем сокращенные данные начали 25.06.2025, нужно позже перейти полностью на сокращенный режим
		for (let uid in players){
			const player=players[uid]
			if (player.n)	player.name=player.n
			if (player.r)	player.rating=player.r
			if (player.s)	player.state=player.s
			if (player.h)	player.hidden=player.h
			if (player.g)	player.game_id=player.g
		}

		//удаляем инвалидных игроков
		for (let uid in players){
			if(!players[uid].name||!players[uid].rating||!players[uid].state)
				delete players[uid];
		}

		//делаем дополнительный объект с игроками и расширяем id соперника
		let p_data = JSON.parse(JSON.stringify(players));

		//создаем массив свободных игроков и обновляем кэш
		for (let uid in players){

			const pdata=players[uid]
			
			//обновляем кэш с первыми данными
			players_cache.update_params(uid,pdata)

			if (pdata.state!=='p'&&!pdata.hidden)
				single[uid] = pdata.name;
		}

		//оставляем только тех кто за столом
		for (let uid in p_data)
			if (p_data[uid].state !== 'p')
				delete p_data[uid];

		//дополняем полными ид оппонента
		for (let uid in p_data) {
			const small_opp_id = p_data[uid].opp_id;
			//проходимся по соперникам
			for (let uid2 in players) {
				let s_id=uid2.substring(0,10);
				if (small_opp_id === s_id) {
					//дополняем полным id
					p_data[uid].opp_id = uid2;
				}
			}
		}

		//определяем столы
		for (let uid in p_data) {
			const opp_id = p_data[uid].opp_id;
			if (p_data[opp_id]) {
				if (uid === p_data[opp_id].opp_id && !tables[uid]) {
					tables[uid] = opp_id;
					delete p_data[opp_id];
				}
			}
		}

		//считаем сколько одиночных игроков и сколько столов
		const num_of_single = Object.keys(single).length;
		const num_of_tables = Object.keys(tables).length;
		const num_of_cards = num_of_single + num_of_tables;

		//если карточек слишком много то убираем столы
		if (num_of_cards > objects.mini_cards.length) {
			const num_of_tables_cut = num_of_tables - (num_of_cards - objects.mini_cards.length);
			const num_of_tables_to_cut = num_of_tables - num_of_tables_cut;

			//удаляем столы которые не помещаются
			const t_keys = Object.keys(tables);
			for (let i = 0 ; i < num_of_tables_to_cut ; i++) {
				delete tables[t_keys[i]];
			}
		}

		//убираем карточки пропавших игроков и обновляем карточки оставшихся
		for(let i=this.starting_card;i<objects.mini_cards.length;i++) {
			if (objects.mini_cards[i].visible === true && objects.mini_cards[i].type === 'single') {
				const card_uid = objects.mini_cards[i].uid;
				if (single[card_uid] === undefined)
					objects.mini_cards[i].visible = false;
				else
					this.update_existing_card({id:i,...players[card_uid]});
			}
		}

		//определяем новых игроков которых нужно добавить
		new_single = {};

		for (let p in single) {

			let found=0;
			for(let i=0;i<objects.mini_cards.length;i++) {
				if (objects.mini_cards[i].visible===true && objects.mini_cards[i].type==='single') {
					if (p===objects.mini_cards[i].uid)
						found=1
				}
			}

			if (found===0)
				new_single[p] = single[p];
		}

		//убираем исчезнувшие столы (если их нет в новом перечне) и оставляем новые
		for(let i=this.starting_card;i<objects.mini_cards.length;i++) {
			if (objects.mini_cards[i].visible && objects.mini_cards[i].type === 'table') {

				const uid1 = objects.mini_cards[i].uid1;
				const uid2 = objects.mini_cards[i].uid2;

				let found = 0;

				for (let t in tables) {
					const t_uid1 = t;
					const t_uid2 = tables[t];
					if (uid1 === t_uid1 && uid2 === t_uid2) {
						delete tables[t];
						found = 1;
					}
				}

				if (found === 0)
					objects.mini_cards[i].visible = false;
			}
		}

		//размещаем на свободных ячейках новых игроков
		for (let uid in new_single)
			this.place_new_card({uid,...players[uid]});

		//размещаем НОВЫЕ столы где свободно
		for (let uid in tables) {
			const name1=players[uid].name
			const name2=players[tables[uid]].name

			const rating1= players[uid].rating
			const rating2= players[tables[uid]].rating

			const game_id=players[uid].game_id;
			this.place_table({uid1:uid,uid2:tables[uid],name1, name2, rating1, rating2,game_id});
		}

	},

	add_card_ai() {

		const card=objects.mini_cards[0]

		//убираем элементы стола так как они не нужны
		card.rating_text1.visible = false;
		card.rating_text2.visible = false;
		card.avatar1.visible = false;
		card.avatar2.visible = false;
		card.avatar1_frame.visible = false;
		card.avatar2_frame.visible = false;
		card.table_rating_hl.visible = false;
		card.bcg.texture=assets.mini_player_card_ai;

		card.visible=true;
		card.uid='bot';
		card.name=card.name_text.text=['Бот','Bot'][LANG];

		card.rating=1400;
		card.rating_text.text = card.rating;
		card.avatar.set_texture(assets.pc_icon);

		//также сразу включаем его в кэш
		if(!players_cache.bot){
			players_cache.bot={};
			players_cache.bot.name=['Бот','Bot'][LANG];
			players_cache.bot.rating=1400;
			players_cache.bot.texture=assets.pc_icon;
		}
	},

	get_state_texture(s,uid) {


		switch(s) {

			case 'o':
				return assets.mini_player_card;
			break;

			case 'b':
				return assets.mini_player_card_bot;
			break;

			case 'p':
				return assets.mini_player_card;
			break;

			case 'b':
				return assets.mini_player_card;
			break;

		}
	},

	place_table(params={uid1:0,uid2:0,name1: 'X',name2:'X', rating1: 1400, rating2: 1400,game_id:0}) {


		for(let i=this.starting_card;i<objects.mini_cards.length;i++) {

			const card=objects.mini_cards[i];

			//это если есть вакантная карточка
			if (!card.visible) {

				//устанавливаем цвет карточки в зависимости от состояния
				card.bcg.texture=this.get_state_texture(params.state);
				card.state=params.state;

				card.type = "table";

				card.bcg.texture = assets.mini_player_card_table;

				//присваиваем карточке данные
				//card.uid=params.uid;
				card.uid1=params.uid1;
				card.uid2=params.uid2;

				//убираем элементы свободного стола
				card.rating_text.visible = false;
				card.avatar.visible = false;
				card.avatar_frame.visible = false;
				card.avatar1_frame.visible = false;
				card.avatar2_frame.visible = false;
				card.name_text.visible = false;

				//Включаем элементы стола
				card.table_rating_hl.visible=true;
				card.rating_text1.visible = true;
				card.rating_text2.visible = true;
				card.avatar1.visible = true;
				card.avatar2.visible = true;
				card.avatar1_frame.visible = true;
				card.avatar2_frame.visible = true;
				//card.rating_bcg.visible = true;

				card.rating_text1.text = params.rating1;
				card.rating_text2.text = params.rating2;

				card.name1 = params.name1;
				card.name2 = params.name2;

				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid1, tar_obj:card.avatar1});

				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid2, tar_obj:card.avatar2});


				card.visible=true;
				card.game_id=params.game_id;

				break;
			}
		}

	},

	update_existing_card(params={id:0,state:'o' ,rating:1400, name:''}) {

		//устанавливаем цвет карточки в зависимости от состояния( аватар не поменялись)
		const card=objects.mini_cards[params.id];
		card.bcg.texture=this.get_state_texture(params.state,card.uid);
		card.state=params.state;

		card.name_text.set2(params.name,105);
		card.rating=params.rating;
		card.rating_text.text=params.rating
		card.icon.visible=params.icon?true:false
		card.visible=true
	},

	place_new_card(params={uid:0, state: 'o', name:'X ', rating: rating}) {

		for(let i=this.starting_card;i<objects.mini_cards.length;i++) {

			//ссылка на карточку
			const card=objects.mini_cards[i];

			if (card.visible) continue

			//устанавливаем цвет карточки в зависимости от состояния
			card.bcg.texture=this.get_state_texture(params.state,params.uid);
			card.state=params.state;

			card.type = 'single'

			//присваиваем карточке данные
			card.uid=params.uid;

			//убираем элементы стола так как они не нужны
			card.rating_text1.visible = false
			card.rating_text2.visible = false
			card.avatar1.visible = false
			card.avatar2.visible = false
			card.avatar1_frame.visible = false
			card.avatar2_frame.visible = false
			card.table_rating_hl.visible=false

			//включаем элементы одиночной карточки
			card.rating_text.visible = true
			card.avatar.visible = true
			card.avatar_frame.visible = true
			card.name_text.visible = true

			card.name=params.name
			card.name_text.set2(params.name,105)
			card.rating=params.rating
			card.rating_text.text=params.rating
			card.icon.visible=params.icon?true:false

			card.visible=true

			const a_tex=players_cache[card.uid].texture
			if (a_tex)
				card.avatar.set_texture(a_tex)
			else
				players_cache.update(card.uid)

			//console.log(`новая карточка ${i} ${params.uid}`)
			return;
		}

	},

	place_table(params={uid1:0,uid2:0,name1: 'X',name2:'X', rating1: 1400, rating2: 1400,game_id:0}) {

		for(let i=this.starting_card;i<objects.mini_cards.length;i++) {

			const card=objects.mini_cards[i];

			//это если есть вакантная карточка
			if (card.visible) continue

			//устанавливаем цвет карточки в зависимости от состояния
			card.bcg.texture=this.get_state_texture(params.state);
			card.state=params.state;

			card.type = "table";

			card.bcg.texture = assets.mini_player_card_table;

			//присваиваем карточке данные
			//card.uid=params.uid;
			card.uid1=params.uid1;
			card.uid2=params.uid2;

			//убираем элементы свободного стола
			card.rating_text.visible = false;
			card.avatar.visible = false;
			card.avatar_frame.visible = false;
			card.avatar1_frame.visible = false;
			card.avatar2_frame.visible = false;
			card.name_text.visible = false;
			card.icon.visible = false
			
			//Включаем элементы стола
			card.table_rating_hl.visible=true
			card.rating_text1.visible = true
			card.rating_text2.visible = true
			card.avatar1.visible = true
			card.avatar2.visible = true
			card.avatar1_frame.visible = true
			card.avatar2_frame.visible = true


			card.rating_text1.text = params.rating1
			card.rating_text2.text = params.rating2

			card.name1 = params.name1;
			card.name2 = params.name2;


			const a_tex1=players_cache[card.uid1].texture
			if (a_tex1)
				card.avatar1.set_texture(a_tex1)
			else
				players_cache.update(card.uid1)


			const a_tex2=players_cache[card.uid2].texture
			if (a_tex2)
				card.avatar2.set_texture(a_tex2)
			else
				players_cache.update(card.uid2)


			card.visible=true;
			card.gid=params.game_id;

			return
		}

	},

	cache_updated(uid,pdata){

		for (const card of objects.mini_cards){
			if (!card.visible) continue

			if (card.type==='single')
				if (card.uid===uid)
					card.avatar.set_texture(pdata.texture)

			if (card.type==='table'){
				if (card.uid1===uid)
					card.avatar1.set_texture(pdata.texture)

				if (card.uid2===uid)
					card.avatar2.set_texture(pdata.texture)
			}
		}
		
		
		//обновляем сообщение
		if(objects.inst_msg_cont.visible&&objects.inst_msg_cont.uid===uid)
			objects.inst_msg_avatar.set_texture(pdata.texture||PIXI.Texture.WHITE)
	},

	card_down(card_id) {

		const card=objects.mini_cards[card_id]
		
		if (objects.mini_cards[card_id].type === 'single')
			this.show_invite_dlg(card.uid)
		
		if (objects.mini_cards[card_id].type === 'table')
			this.show_table_dialog(card_id)

	},

	show_table_dialog(card_id) {

		//если какая-то анимация или открыт диалог
		if (anim3.any_on() || pending_player!=='') {
			sound.play('locked');
			return
		};

		sound.play('click');
		//закрываем диалог стола если он открыт
		if(objects.invite_cont.visible) this.close_invite_dialog()

		anim3.add(objects.td_cont, {x: [800, objects.td_cont.sx, 'linear']}, true, 0.1)

		const card=objects.mini_cards[card_id]
		
		objects.td_avatar1.set_texture(players_cache[card.uid1].texture)
		objects.td_avatar2.set_texture(players_cache[card.uid2].texture)

		objects.td_rating1.text = card.rating_text1.text
		objects.td_rating2.text = card.rating_text2.text

		objects.td_name1.set2(card.name1,240)
		objects.td_name2.set2(card.name2,240)
		
		objects.watch_button.pointerdown=()=>{				
			this.peek_down(card.gid)
		}

	},

	close_table_dialog() {
		
		if (!objects.td_cont.ready) {
			sound.play('locked');
			return
		};
		
		sound.play('close');
		anim3.add(objects.td_cont, {x: [objects.td_cont.x, 800, 'linear']}, false, 0.1);
	},

	show_invite_dlg(uid) {

		//если какая-то анимация или уже сделали запрос
		if (anim3.any_on() || pending_player!=='') {
			sound.play('locked');
			return
		};

		//закрываем диалог стола если он открыт
		if(objects.td_cont.visible) this.close_table_dialog();

		pending_player=''

		sound.play('click')

		objects.invite_feedback.text = ''

		//показыаем кнопку приглашения
		objects.invite_button.texture=assets.invite_button

		anim3.add(objects.invite_cont, {x: [800, objects.invite_cont.sx, 'linear']}, true, 0.15);

		//предварительные данные
		lobby.opp_uid=uid
		const opp_data=players_cache[uid]


		this.show_feedbacks(uid);

		let invite_available=uid !== my_data.uid
		invite_available=invite_available || lobby.opp_uid==='bot'
		invite_available=invite_available && opp_data.rating >= 50 && my_data.rating >= 50

		//иконка если есть
		objects.invite_icon.texture=opp_data.icon?assets.cup_icon:null

		//на моей карточке показываем стастику
		if(lobby.opp_uid===my_data.uid){
			objects.invite_my_stat.text=[`Рейтинг: ${my_data.rating}\nИгры: ${my_data.games}`,`Rating: ${my_data.rating}\nGames: ${my_data.games}`][LANG]
			objects.invite_my_stat.visible=true;
		}else{
			objects.invite_my_stat.visible=false;
		}
		
		//кнопка удаления комментариев
		objects.fb_delete_button.visible=my_data.uid===lobby.opp_uid;

		//если мы в списке игроков которые нас недавно отврегли
		if (this.rejected_invites[lobby.opp_uid] && Date.now()-this.rejected_invites[lobby.opp_uid]<60000) invite_available=false;

		//показыаем кнопку приглашения только если это допустимо
		objects.invite_button.visible=invite_available;

		//заполняем карточу приглашения данными
		objects.invite_avatar.set_texture(opp_data.texture)
		objects.invite_name.set2(opp_data.name,230)
		objects.invite_rating.text=opp_data.rating

	},

	fb_delete_down(){

		return
		
		objects.fb_delete_button.visible=false;
		fbs.ref('fb/' + my_data.uid).remove();
		this.fb_cache[my_data.uid].fb_obj={0:[['***нет отзывов***','***no feedback***'][LANG],999,' ']};
		this.fb_cache[my_data.uid].tm=Date.now();
		objects.feedback_records.forEach(fb=>fb.visible=false);

		pmsg.add({t:['Отзывы удалены','Feedbacks are removed'][LANG]})

	},

	async show_invite_dlg_from_chat(uid) {

		if (anim3.any_on() || pending_player!=='') return
		this.show_invite_dlg(uid)
		
	},

	async show_feedbacks(uid) {

		//получаем фидбэки сначала из кэша, если их там нет или они слишком старые то загружаем из фб
		let fb_obj;
		if (!this.fb_cache[uid] || (Date.now()-this.fb_cache[uid].tm)>120000) {

			fb_obj =await my_ws.get('fb/' + uid)

			//сохраняем в кэше отзывов
			this.fb_cache[uid]={}
			this.fb_cache[uid].tm=Date.now()
			if (fb_obj){
				this.fb_cache[uid].fb_obj=fb_obj;
			}else{
				fb_obj=[{nofb:1}];
				this.fb_cache[uid].fb_obj=fb_obj;
			}

			//console.log('загрузили фидбэки в кэш')

		} else {
			fb_obj =this.fb_cache[uid].fb_obj;
			//console.log('фидбэки из кэша ,ура')
		}

		//сортируем отзывы по дате
		fb_obj.sort(function(a,b) {
			return b.tm-a.tm
		});

		//сначала убираем все фидбэки
		objects.feedback_records.forEach(fb=>fb.visible=false)

		let prv_fb_bottom=0;
		const fb_cnt=Math.min(fb_obj.length,objects.feedback_records.length);
		for (let i = 0 ; i < fb_cnt;i++) {
			const fb_place=objects.feedback_records[i];

			//устанаваем отзыв
			fb_place.set(fb_obj[i])

			const fb_height=fb_place.text.textHeight*0.95
			const fb_end=prv_fb_bottom+fb_height

			//если отзыв будет выходить за экран то больше ничего не отображаем
			const fb_end_abs=fb_end+objects.invite_cont.y+objects.invite_feedback.y
			if (fb_end_abs>450) return;

			fb_place.visible=true
			fb_place.y=prv_fb_bottom
			prv_fb_bottom+=fb_height
		}
	},

	async close() {

		if (objects.invite_cont.visible) this.close_invite_dialog()
		if (objects.td_cont.visible) this.close_table_dialog()
		if (objects.pref_cont.visible) pref.close()		

		//плавно все убираем
		anim3.add(objects.cards_cont, {alpha: [1, 0, 'linear']}, false, 0.1)
		anim3.add(objects.lobby_footer_cont, {y: [ objects.lobby_footer_cont.y, 450, 'linear']}, false, 0.2)
		anim3.add(objects.lobby_header_cont, {y: [objects.lobby_header_cont.y, -50, 'linear']}, false, 0.2)

		//больше ни ждем ответ ни от кого
		pending_player=''
		this.on=0

		//отписываемся от изменений состояний пользователей через 30 секунд
		this.state_listener_timeout=setTimeout(()=>{
			this.disconnect();
		},30000);

	},

	disconnect(){
		console.log('lobby disconnected')
		this.global_players={}
		if(ROOM_NAME) fbs.ref(ROOM_NAME).off()
		this.state_listener_on=0
	},

	connect(){

		console.log('lobby connected');
		fbs.ref(ROOM_NAME).on('child_changed', s => {
			const val=s.val()
			this.global_players[s.key]=val
			lobby.players_list_updated(this.global_players)
		});
		fbs.ref(ROOM_NAME).on('child_added', s => {
			const val=s.val()
			this.global_players[s.key]=val
			lobby.players_list_updated(this.global_players)
		});
		fbs.ref(ROOM_NAME).on('child_removed', s => {
			const val=s.val()
			delete this.global_players[s.key]
			lobby.players_list_updated(this.global_players)
		});

		fbs.ref(ROOM_NAME+'/'+my_data.uid).onDisconnect().remove()
		this.state_listener_on=1

	},
	
	change_room(new_room){
		
		this.disconnect()
		if(ROOM_NAME)
			fbs.ref(ROOM_NAME+'/'+my_data.uid).remove()
		ROOM_NAME=new_room
		this.connect()
		
		//создаем заголовки
		const room_desc=['КОМНАТА #','ROOM #'][LANG]+ROOM_NAME.slice(6)
		objects.t_room_name.text=room_desc	

		set_state({state:'o'})
	},

	async inst_message(data){

		//когда ничего не видно не принимаем сообщения
		if(!objects.cards_cont.visible) return

		await players_cache.update(data.uid)

		sound.play('inst_msg')
		anim3.add(objects.inst_msg_cont, {alpha: [0, 1, 'linear']}, true, 0.4, false)
		objects.inst_msg_avatar.texture=players_cache[data.uid].texture||PIXI.Texture.WHITE
		objects.inst_msg_text.set2(data.msg,290)
		objects.inst_msg_cont.tm=Date.now()
		
		clearTimeout(objects.inst_msg_cont.close_timer)
		objects.inst_msg_cont.close_timer=setTimeout(()=>{
			anim3.add(objects.inst_msg_cont, {alpha: [1, 0, 'linear']}, false, 0.4, false)
		},7000)
		
	},

	get_room_to_go(){
	
		//return 'states5'
		
		//московское время и ночная комната
		if (SERVER_TM){
			const msk_hour=+new Date(SERVER_TM).toLocaleString('en-US', {timeZone: 'Europe/Moscow',hour:'numeric',hourCycle:'h23'})
			if (msk_hour>=0&&msk_hour<6)
				return 'statesNIGHT'		
		}	
		
		//номер комнаты в зависимости от рейтинга игрока
		const rooms_bins=[0,1366,1437,1580,9999];
		for (let i=1;i<rooms_bins.length;i++){
			const f=rooms_bins[i-1];
			const t=rooms_bins[i];
			if (my_data.rating>f&&my_data.rating<=t)
				return 'states'+i
		}
		return 'states1'

	},

	peek_down(gid){

		if (anim3.any_on()) {
			sound.play('locked');
			return
		};
		sound.play('click');
		this.close();

		//активируем просмотр игры
		game_watching.activate({gid})
	},

	wheel_event(dir) {

	},

	close_invite_dialog() {

		if (!objects.invite_cont.ready) return;
		
		sound.play('close');
		
		//отправляем сообщение что мы уже не заинтересованы в игре
		if (pending_player!=='') {
			fbs.ref("inbox/"+pending_player).set({sender:my_data.uid,message:"INV_REM",tm:Date.now()});
			pending_player='';
		}

		anim3.add(objects.invite_cont, {x: [objects.invite_cont.x, 800, 'linear']}, false, 0.15);
	},

	async send_invite() {


		if (!objects.invite_cont.ready||!objects.invite_cont.visible||objects.invite_button.texture===assets.invite_wait_img){
			sound.play('locked');
			return
		};

		if (anim3.any_on()){
			sound.play('locked');
			return
		};

		if (lobby.opp_uid==='bot')
		{
			this.close()
			game.activate({opp:bot_game, role:'master',opp_uid:'bot'});
		} else {
			sound.play('click');
			objects.invite_button.texture=assets.invite_wait_img;
			fbs.ref('inbox/'+lobby.opp_uid).set({sender:my_data.uid,message:'INV',tm:Date.now()});
			pending_player=lobby.opp_uid;

		}

	},

	rejected_invite(msg) {

		this.rejected_invites[pending_player]=Date.now();
		pending_player="";
		this.close_invite_dialog();
		if(msg==='REJECT_ALL')
			big_msg.show({t1:['Соперник пока не принимает приглашения.','The opponent refused to play.'][LANG],t2:'---',t3:'',fb:0});
		else
			big_msg.show({t1:['Соперник отказался от игры. Повторить приглашение можно через 1 минуту.','The opponent refused to play. You can repeat the invitation in 1 minute'][LANG],t2:'---',t3:'',fb:0});

	},

	async accepted_invite(data) {

		game.activate({opp:online_game, role:'master',gid:data.game_id,opp_uid:data.sender});

	},

	chat_btn_down(){
		if (anim3.any_on()) {
			sound.play('locked');
			return
		};

		sound.play('click');
		
		
		anim3.add(objects.lobby_chat_btn, {alpha:[0.25, 1, 'linear']}, true, 0.5)
		
		//подсветка
		objects.lobby_btn_hl.x=objects.lobby_lb_btn.x;
		objects.lobby_btn_hl.y=objects.lobby_lb_btn.y;
		anim3.add(objects.lobby_btn_hl, {alpha: [0, 1, 'ease3peaks']}, false, 0.25, false);

		this.close();
		chat.activate();

	},

	trnm_btn_down(){
		
		if (anim3.any_on()) {
			sound.play('locked')
			return
		}
		

		sound.play('click');
		//return
		this.close()
		trnm.activate()

	},
	
	async lb_btn_down() {

		if (anim3.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		//подсветка
		objects.lobby_btn_hl.x=objects.lobby_lb_btn.x;
		objects.lobby_btn_hl.y=objects.lobby_lb_btn.y;
		anim3.add(objects.lobby_btn_hl, {alpha: [0, 1, 'ease3peaks']}, false, 0.25, false);


		await this.close();
		lb.show();
	},

	list_btn_down(dir){

		if (anim3.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');
		const cur_x=objects.cards_cont.x;
		const new_x=cur_x-dir*800;


		//подсветка
		const tar_btn={'-1':objects.lobby_left_btn,'1':objects.lobby_right_btn}[dir];
		objects.lobby_btn_hl.x=tar_btn.x;
		objects.lobby_btn_hl.y=tar_btn.y;
		anim3.add(objects.lobby_btn_hl, {alpha: [0, 1, 'ease3peaks']}, false, 0.25, false);


		if (new_x>0 || new_x<-800) {
			sound.play('locked');
			return
		}

		anim3.add(objects.cards_cont, {x: [cur_x, new_x, 'easeInOutCubic']}, true, 0.2);
	},

	async exit_lobby_down() {

		if (anim3.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('close');

		await this.close();
		lobby.activate();

	},

	info_btn_down(){

		if (anim3.any_on()) {
			sound.play('locked');
			return
		};
		sound.play('click');

		if(!objects.info_cont.init){

			objects.info_msg.text=`Новые правила:\n1.Для игроков с рейтингом выше ${MAX_NO_REP_RATING}, встречающих одного и того же соперника более 6 раз за последние 20 матчей, действует особое правило: рейтинг не будет увеличиваться при победах (однако может снижаться при поражениях), подтверждение рейтинга не будет засчитано. Эта мера поощряет разнообразие поединков и поддерживает честную соревновательную среду.\n2.Игроки с рейтингом выше ${MAX_NO_CONF_RATING} должны подтвердить свой рейтинг в течении ${DAYS_TO_CONF_RATING} дней сыграв минимум одну игру.`

			objects.info_cont.init=1;
		}

		anim3.add(objects.info_cont, {alpha: [0, 1, 'linear']}, true, 0.25);

	},

	info_close_down(){

		if (anim3.any_on()) {
			sound.play('locked');
			return
		};
		sound.play('close');

		anim3.add(objects.info_cont, {alpha: [1, 0, 'linear']}, false, 0.25);

	}

}

stickers = {

	page:0,
	hide_send_sticker:0,
	promise_resolve_send :0,
	promise_resolve_recive :0,

	click_commands:[
		{x:272,y:72,w:83,h:83,f:()=>{stickers.send(0)}},
		{x:360,y:72,w:83,h:83,f:()=>{stickers.send(1)}},
		{x:447,y:72,w:83,h:83,f:()=>{stickers.send(2)}},
		{x:272,y:156,w:83,h:83,f:()=>{stickers.send(3)}},
		{x:360,y:156,w:83,h:83,f:()=>{stickers.send(4)}},
		{x:447,y:156,w:83,h:83,f:()=>{stickers.send(5)}},
		{x:272,y:241,w:83,h:83,f:()=>{stickers.send(6)}},
		{x:360,y:241,w:83,h:83,f:()=>{stickers.send(7)}},
		{x:447,y:241,w:83,h:83,f:()=>{stickers.send(8)}},
		{x:275,y:340,w:66,h:54,hl:1,f:()=>{stickers.switch_page(-1)}},
		{x:368,y:340,w:66,h:54,hl:1,f:()=>{stickers.hide_panel()}},
		{x:462,y:340,w:66,h:54,hl:1,f:()=>{stickers.switch_page(1)}}
	],

	show_panel() {


		if (anim3.any_on()===true) {
			sound.play('locked');
			return
		};


		if (objects.stickers_cont.ready===false)
			return;
		sound.play('click');


		//ничего не делаем если панель еще не готова
		if (objects.stickers_cont.ready===false || objects.stickers_cont.visible===true || state!=="p")
			return;

		//анимационное появление панели стикеров
		anim3.add(objects.stickers_cont, {y: [450, objects.stickers_cont.sy, 'easeOutBack']}, true, 0.25);

	},

	hide_panel() {

		sound.play('close');

		if (objects.stickers_cont.ready===false)
			return;

		//анимационное появление панели стикеров
		anim3.add(objects.stickers_cont, {y: [objects.stickers_cont.sy, 450, 'easeInBack']}, false, 0.25);

	},

	switch_page(dir){


		if (this.page+dir<0){
			sound.play('locked')
			return;
		}

		this.page+=dir;

		for (let i=0;i<9;i++)
			objects.sticker_icon[i].texture=assets['sticker_texture_'+(this.page*9+i)]
	},

	bcg_down(e){

		if (anim3.any_on()){
			sound.play('locked')
			return
		}

		const mx = e.data.global.x/app.stage.scale.x
		const my = e.data.global.y/app.stage.scale.y

		for (let command of this.click_commands){
			if (mx>command.x&&mx<command.x+command.w&&my>command.y&&my<command.y+command.h){

				if (command.hl){
					objects.stickers_btn_hl.x=command.x-10-objects.stickers_cont.x;
					objects.stickers_btn_hl.y=command.y-10-objects.stickers_cont.y;
					anim3.add(objects.stickers_btn_hl, {alpha: [1, 0, 'linear']}, false, 0.5, false);

				}

				command.f()
				return;
			}
		}

	},

	async send(id) {


		//удаляем если идет ожидание
		if (this.hide_send_sticker)
			clearTimeout(this.hide_send_sticker)

		const sticket_id=id+this.page*9

		//показываем какой стикер мы отправили
		objects.sent_sticker_area.texture=assets['sticker_texture_'+sticket_id];
		anim3.add(objects.sent_sticker_area, {alpha: [0, 0.5, 'linear']}, true, 0.5, false);

		this.hide_send_sticker=setTimeout(()=>{
			anim3.add(objects.sent_sticker_area, {alpha: [0.5, 0, 'linear']}, false, 0.5, false)
			this.hide_send_sticker=0
		},3000)


		if (!opp_data?.uid){
			return
		}

		if (this.promise_resolve_send!==0)
			this.promise_resolve_send("forced");

		this.hide_panel();

		fbs.ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"MSG",tm:Date.now(),data:sticket_id});

	},

	async receive(id) {


		if (this.promise_resolve_recive!==0)
			this.promise_resolve_recive("forced");

		//воспроизводим соответствующий звук
		sound.play('receive_sticker');

		objects.rec_sticker_area.texture=assets['sticker_texture_'+id];

		await anim3.add(objects.rec_sticker_area,{x:[-150, objects.rec_sticker_area.sx,'easeOutBack']}, true, 0.5,false);

		let res = await new Promise((resolve, reject) => {
				stickers.promise_resolve_recive = resolve;
				setTimeout(resolve, 2000)
			}
		);

		if (res === "forced")
			return;

		anim3.add(objects.rec_sticker_area,{x:[objects.rec_sticker_area.sx, -150,'easeInBack']}, false, 0.5,false);

	}

}

auth2 = {

	load_script(src) {
	  return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.onload = () => resolve(1)
        script.onerror = () => resolve(0)
        script.src = src
        document.head.appendChild(script)
	  })
	},

	get_random_char() {

		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		return chars[hf.randIntInc(0,chars.length-1)];

	},

	get_random_uid_for_local(prefix) {

		let uid = prefix;
		for ( let c = 0 ; c < 12 ; c++ )
			uid += this.get_random_char();

		//сохраняем этот uid в локальном хранилище
		try {
			localStorage.setItem('poker_uid', uid);
		} catch (e) {alert(e)}

		return uid;

	},

	get_random_name(uid) {

		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		const rnd_names = ['Gamma','Chime','Dron','Perl','Onyx','Asti','Wolf','Roll','Lime','Cosy','Hot','Kent','Pony','Baker','Super','ZigZag','Magik','Alpha','Beta','Foxy','Fazer','King','Kid','Rock'];

		if (uid !== undefined) {

			let e_num1 = chars.indexOf(uid[3]) + chars.indexOf(uid[4]) + chars.indexOf(uid[5]) + chars.indexOf(uid[6]);
			e_num1 = Math.abs(e_num1) % (rnd_names.length - 1);
			let name_postfix = chars.indexOf(uid[7]).toString() + chars.indexOf(uid[8]).toString() + chars.indexOf(uid[9]).toString() ;
			return rnd_names[e_num1] + name_postfix.substring(0, 3);

		} else {

			let rnd_num = hf.randIntInc(0, rnd_names.length - 1);
			let rand_uid = hf.randIntInc(0, 999999)+ 100;
			let name_postfix = rand_uid.toString().substring(0, 3);
			let name =	rnd_names[rnd_num] + name_postfix;
			return name;
		}
	},

	async get_country_code () {

		let country_code = ''
		try {
			let resp1 = await fetch("https://ipinfo.io/json?token=a3455d3185ba47");
			let resp2 = await resp1.json();
			country_code = resp2.country;
		} catch(e){}

		return country_code;

	},

	search_in_local_storage() {

		//ищем в локальном хранилище
		let local_uid = null;

		try {
			local_uid = localStorage.getItem('poker_uid');
		} catch (e) {alert(e)}

		if (local_uid !== null) return local_uid;

		return undefined;

	},

	replace_bad_letter(s){
		
		//убираем ё и Ё
		return s.replace(/ё/g, 'е').replace(/Ё/g, 'Е')
		
	},

	async init() {

		if (game_platform === 'YANDEX') {

			try {await this.load_script('https://yandex.ru/games/sdk/v2')} catch (e) {alert(e)};

			let _player;

			try {
				window.ysdk = await YaGames.init({});
				_player = await window.ysdk.getPlayer();
			} catch (e) { alert(e)};

			my_data.uid = _player.getUniqueID().replace(/[\/+=]/g, '')
			my_data.name = _player.getName()
			my_data.name=this.replace_bad_letter(my_data.name)
			my_data.orig_pic_url = _player.getPhoto('medium')
			my_data.auth_mode=+_player.isAuthorized()

			if (my_data.orig_pic_url === 'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/0/islands-retina-medium')
				my_data.orig_pic_url = 'mavatar'+my_data.uid;

			if (my_data.name === '')
				my_data.name = this.get_random_name(my_data.uid);

			return;
		}

		if (game_platform === 'VK' || game_platform==='OK') {

			await this.load_script('https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js')||await this.load_script('https://akukamil.github.io/common/vkbridge.js');

			let _player;
			try {
				await vkBridge.send('VKWebAppInit');
				_player = await vkBridge.send('VKWebAppGetUserInfo');
			} catch (e) {alert(e)};

			my_data.name=_player.first_name + ' ' + _player.last_name
			my_data.name=this.replace_bad_letter(my_data.name)
			my_data.uid=game_platform.toLowerCase()+_player.id
			my_data.orig_pic_url=_player.photo_100
			my_data.auth_mode=1
			return;
		}

		if (game_platform === 'DEBUG') {

			my_data.name = my_data.uid = 'debug' + prompt('Отладка. Введите ID', 100);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;
			my_data.auth_mode=1
			return;
		}

		if (game_platform === 'UNKNOWN') {

			//если не нашли платформу
			alert('Неизвестная платформа. Кто Вы?')
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('LS_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;
			my_data.auth_mode=1
		}
	}

}

top3={

	async activate(path){

		const top3=await my_ws.get(path||'day_top3')
		if(!top3) return
		const uids=Object.keys(top3)
		if (uids.length!==3) return

		const sorted_top3 = Object.entries(top3).sort((a, b) => b[1] - a[1])
		const ordered_uids = [sorted_top3[1][0], sorted_top3[0][0], sorted_top3[2][0]]

		await players_cache.update(ordered_uids[0])
		objects.day_top3_name1.set2(players_cache[ordered_uids[0]].name,145)

		await players_cache.update(ordered_uids[1])
		objects.day_top3_name2.set2(players_cache[ordered_uids[1]].name,145)

		await players_cache.update(ordered_uids[2])
		objects.day_top3_name3.set2(players_cache[ordered_uids[2]].name,145)


		objects.day_top3_avatar1.set_texture(players_cache[ordered_uids[0]].texture)
		objects.day_top3_avatar2.set_texture(players_cache[ordered_uids[1]].texture)
		objects.day_top3_avatar3.set_texture(players_cache[ordered_uids[2]].texture)

		objects.day_top3_lights1.text=top3[ordered_uids[0]]
		objects.day_top3_lights2.text=top3[ordered_uids[1]]
		objects.day_top3_lights3.text=top3[ordered_uids[2]]

		some_process.top3_anim=()=>{this.process()}
		sound.play('top3')
		anim3.add(objects.day_top3_cont, {alpha: [0, 1, 'linear']}, true, 0.5);


	},

	process(){

		objects.day_top3_sunrays.rotation+=0.01

	},

	close(){

		if (anim3.any_on()) {
			sound.play('locked')
			return
		}
		
		sound.play('close')
		anim3.add(objects.day_top3_cont, {alpha: [1, 0, 'linear']}, false, 0.25);


	}

}

function resize() {
    const vpw = document.body.clientWidth;  // Width of the viewport
    const vph = document.body.clientHeight; // Height of the viewport
    let nvw; // New game width
    let nvh; // New game height

    if (vph / vpw < M_HEIGHT / M_WIDTH) {
      nvh = vph;
      nvw = (nvh * M_WIDTH) / M_HEIGHT;
    } else {
      nvw = vpw;
      nvh = (nvw * M_HEIGHT) / M_WIDTH;
    }
    app.renderer.resize(nvw, nvh);
    app.stage.scale.set(nvw / M_WIDTH, nvh / M_HEIGHT);
}

function set_state(params) {

	if (params.state!==undefined)
		state=params.state;

	if (params.hidden!==undefined)
		h_state=+params.hidden;

	let small_opp_id='';
	if (opp_data.uid)
		small_opp_id=opp_data.uid.substring(0,10);

	if (ROOM_NAME){
		const my_state_data={s:state, n:my_data.name, r:my_data.rating, h:h_state, opp_id : small_opp_id, g:online_game.gid}
		
		//если есть иконка
		if (my_data.trnm_winner) my_state_data.icon=1
		
		fbs.ref(ROOM_NAME+'/'+my_data.uid).set(my_state_data);		
	}


}

tabvis={

	inactive_timer:0,
	sleep:0,

	change(){

		if (document.hidden){
			anim3.finish_all_slots()
			this.inactive_timer=setTimeout(()=>{this.send_to_sleep()},120000)
			PIXI.sound.muteAll()
		}else{
			
			PIXI.sound.unmuteAll()
			if(this.sleep){
				if (lobby.on) lobby.activate()
				my_ws.reconnect('wakeup')
				this.sleep=0
			}
			clearTimeout(this.inactive_timer);
		}

		set_state({hidden:document.hidden});

	},

	send_to_sleep(){

		this.sleep=1
		lobby.disconnect()		
		fbs.ref(ROOM_NAME+'/'+my_data.uid).remove()
		if(chat.on) chat.close()
		my_ws.send_to_sleep()
	
		if(my_data.uid==='YfgniBZLIRWtvIOVUlKlPzpnBPurlQcBt3IyPJPz1n8'){
			fbs.ref('alex_case').push({send_to_sleep:1,tm:firebase.database.ServerValue.TIMESTAMP})
		}
	}

}

language_dialog = {

	p_resolve : {},

	show () {

		return new Promise(function(resolve, reject){


			document.body.innerHTML='<style>	html,	body {margin: 0;padding: 0;	height: 100%;}	body {display:flex;align-items: center;justify-content: center;background-color: rgba(24,24,64,1);	flex-direction: column}	.two_buttons_area {	  width: 70%; height: 50%; margin: 20px 20px 0px 20px;	display: flex; flex-direction: row;	}	.button {margin: 5px 5px 5px 5px;width: 50%;	height: 100%;color:white;display: block;background-color: rgba(44,55,100,1);font-size: 10vw;padding: 0px;}  #m_progress {background: rgba(11,255,255,0.1);justify-content: flex-start;	  border-radius: 100px;	  align-items: center;	  position: relative;	  padding: 0 5px;display: none;	  height: 50px;	  width: 70%;}	#m_bar {	  box-shadow: 0 10px 40px -10px #fff;	  border-radius: 100px;	  background: #fff;	  height: 70%;	  width: 0%;}	</style><div id ="two_buttons" class="two_buttons_area">	<button class="button" id ="but_ref1" onclick="language_dialog.p_resolve(0)">RUS</button>	<button class="button" id ="but_ref2"  onclick="language_dialog.p_resolve(1)">ENG</button></div><div id="m_progress">  <div id="m_bar"></div></div>';

			language_dialog.p_resolve = resolve;

		})

	}

}

async function define_platform_and_language() {

	let s = window.location.href;

	if (s.includes('yandex')||s.includes('app-id=163940')) {

		game_platform = 'YANDEX';

		if (s.match(/yandex\.ru|yandex\.by|yandex\.kg|yandex\.kz|yandex\.tj|yandex\.ua|yandex\.uz/))
			LANG = 0;
		else
			LANG = 1;
		return;
	}

	if (s.includes('vk_ok_app_id')||s.includes('vk_ok_user_id')) {

		game_platform = 'OK';
		LANG = 0;
		return;
	}

	if (s.includes('vk.com')||s.includes('vk.ru')||s.includes('vk_app_id')) {

		game_platform = 'VK';
		LANG = 0;
		return;
	}

	if (s.includes('google_play')) {

		game_platform = 'GOOGLE_PLAY';
		LANG = await language_dialog.show();
		return;
	}

	if (s.includes('my_games')) {

		game_platform = 'MY_GAMES';
		LANG = 0;
		return;
	}

	if (s.includes('192.168.')||s.includes('127.0.')) {

		game_platform = 'DEBUG';
		LANG = await language_dialog.show();
		return;
	}

	game_platform = 'UNKNOWN';
	LANG = await language_dialog.show();

}

main_loader={

	divide_texture(t,frame_w,frame_h, names){
		
		const frames_x=Math.floor(t.width/frame_w)
		const frames_y=Math.floor(t.height/frame_h)
			
		if (typeof(names)==='string'){
			assets[names]=[]
			let i=0
			for (let y=0;y<frames_y;y++){
				for (let x=0;x<frames_x;x++){
					const rect=new PIXI.Rectangle(x*frame_w, y*frame_h, frame_w, frame_h)
					assets[names][i]=new PIXI.Texture(t.baseTexture, rect)
					i++
				}
			}			
		}else{
			
			let i=0
			for (let y=0;y<frames_y;y++){
				for (let x=0;x<frames_x;x++){
					const rect=new PIXI.Rectangle(x*frame_w, y*frame_h, frame_w, frame_h)
					assets[names[i]]=new PIXI.Texture(t.baseTexture, rect)
					i++
				}
			}			
		}
	},

	async load1(){

		//ресурсы
		const loader=new PIXI.Loader();

		//добавляем фон отдельно
		loader.add('loader_bcg',git_src+`res/common/loader_bcg_${['ru','en'][LANG]}_img.jpg`);
		loader.add('loader_bar_frame',git_src+'res/common//loader_bar_frame_img.png');
		loader.add('loader_bar_bcg',git_src+'res/common/loader_bar_bcg_img.png');

		//добавляем основной загрузочный манифест
		loader.add('main_load_list',git_src+'load_list.txt');

		await new Promise(res=>loader.load(res))

		//переносим все в ассеты
		for (const res_name in loader.resources){
			const res=loader.resources[res_name];
			assets[res_name]=res.texture||res.sound||res.data;
		}


		//элементы загрузки
		objects.loader_cont=new PIXI.Container();


		objects.bcg=new PIXI.Sprite(assets.loader_bcg);
		objects.bcg.width=820;
		objects.bcg.height=470;
		objects.bcg.x=-10;
		objects.bcg.y=-10;

		objects.loader_bar_mask=new PIXI.Graphics();
		objects.loader_bar_mask.beginFill(0xff0000);
		objects.loader_bar_mask.drawRect(0, 0, 240, 50);
		objects.loader_bar_mask.endFill(0xff0000);
		objects.loader_bar_mask.x=280;
		objects.loader_bar_mask.y=370;
		objects.loader_bar_mask.width=0;

		objects.loader_bar_frame=new PIXI.Sprite(assets.loader_bar_frame);
		objects.loader_bar_frame.x=270;
		objects.loader_bar_frame.y=370;
		objects.loader_bar_frame.width=260;
		objects.loader_bar_frame.height=50;

		objects.loader_bar_bcg=new PIXI.Sprite(assets.loader_bar_bcg);
		objects.loader_bar_bcg.x=270;
		objects.loader_bar_bcg.y=370;
		objects.loader_bar_bcg.width=260;
		objects.loader_bar_bcg.height=50;
		objects.loader_bar_bcg.mask=objects.loader_bar_mask;

		objects.loader_cont.addChild(objects.loader_bar_bcg,objects.loader_bar_frame,objects.loader_bar_mask);
		app.stage.addChild(objects.bcg,objects.loader_cont);

	},

	async load2(){


		const loader=new PIXI.Loader();

		//подпапка с ресурсами
		const lang_pack = ['RUS','ENG'][LANG];

		loader.add("m2_font", COM_URL+"/fonts/bahnschrift48/f.fnt");
		loader.add("m3_font", COM_URL+"/fonts/bahnschrift48s/f.fnt");

		loader.add('receive_move',git_src+'sounds/receive_move.mp3');
		loader.add('note',git_src+'sounds/note.mp3');
		loader.add('receive_sticker',git_src+'sounds/receive_sticker.mp3');
		loader.add('message',git_src+'sounds/message.mp3');
		loader.add('lose',git_src+'sounds/lose.mp3');
		loader.add('win',git_src+'sounds/win.mp3');
		loader.add('click',git_src+'sounds/click.mp3');
		loader.add('close',git_src+'sounds/close.mp3');
		loader.add('move',git_src+'sounds/move.mp3');
		loader.add('locked',git_src+'sounds/locked.mp3');
		loader.add('clock',git_src+'sounds/clock.mp3');
		loader.add('keypress',git_src+'sounds/keypress.mp3');
		loader.add('online_message',git_src+'sounds/online_message.mp3');
		loader.add('inst_msg',git_src+'sounds/inst_msg.mp3');
		loader.add('beep',git_src+'sounds/beep.mp3');
		loader.add('mini_dialog',git_src+'sounds/mini_dialog.mp3');
		loader.add('bonus',git_src+'sounds/bonus.mp3');
		loader.add('confirm_dlg',git_src+'sounds/confirm_dlg.mp3');
		loader.add('top3',git_src+'sounds/top3.mp3');
		loader.add('trnm_event',git_src+'sounds/trnm_event.mp3');


		//loader.add('cards_design_pack', git_src+'res/RUS/cards_designs/cards_design_pack.png');
		//loader.add('mini_cards_pack', git_src+'res/RUS/cards_designs/mini_cards_pack.png');


		//добавляем текстуры стикеров
		for (let i=0;i<27;i++)
			loader.add('sticker_texture_'+i, 'https://akukamil.github.io/common/stickers/'+i+'.png');

		//добавляем из листа загрузки
		const load_list=eval(assets.main_load_list);
		for (let i = 0; i < load_list.length; i++)
			if (load_list[i].class ==='sprite'|| load_list[i].class ==='image')
				loader.add(load_list[i].name, git_src+'res/'+lang_pack + '/' + load_list[i].name + '.' +  load_list[i].image_format);

		loader.onProgress.add(ldr=>{
			objects.loader_bar_mask.width =  240*ldr.progress*0.01;
		});
		await new Promise(res=> loader.load(res));

		//переносим все в ассеты
		for (const res_name in loader.resources){
			const res=loader.resources[res_name];
			assets[res_name]=res.texture||res.sound||res.data;
		}

		this.divide_texture(assets.cards_design_pack,140,140,Object.values(DESIGN_DATA).map(v=>v.name))
		this.divide_texture(assets.mini_cards_pack,300,135,['table_rating_hl','mini_player_card','mini_player_card_ai','mini_player_card_table','mini_player_card_bot'])
		this.divide_texture(assets.trnm_cards_pack,210,120,['trnm_card_empty_bcg','trnm_card_bcg','trnm_card_playing_bcg','trnm_card_set_bcg'])

		//создаем спрайты и массивы спрайтов и запускаем первую часть кода
		for (let i = 0; i < load_list.length; i++) {
			const obj_class = load_list[i].class;
			const obj_name = load_list[i].name;
			console.log('Processing: ' + obj_name)

			switch (obj_class) {
			case "sprite":
				objects[obj_name] = new PIXI.Sprite(assets[obj_name]);
				eval(load_list[i].code0);
				break;

			case "block":
				eval(load_list[i].code0);
				break;

			case "cont":
				eval(load_list[i].code0);
				break;

			case "array":
				const a_size=load_list[i].size;
				objects[obj_name]=[];
				for (let n=0;n<a_size;n++)
					eval(load_list[i].code0);
				break;
			}
		}

		//обрабатываем вторую часть кода в объектах
		for (let i = 0; i < load_list.length; i++) {
			const obj_class = load_list[i].class;
			const obj_name = load_list[i].name;
			console.log('Processing: ' + obj_name)


			switch (obj_class) {
			case "sprite":
				eval(load_list[i].code1);
				break;

			case "block":
				eval(load_list[i].code1);
				break;

			case "cont":
				eval(load_list[i].code1);
				break;

			case "array":
				const a_size=load_list[i].size;
					for (let n=0;n<a_size;n++)
						eval(load_list[i].code1);	;
				break;
			}
		}

		anim3.add(objects.bcg, {alpha: [1, 0, 'linear']}, false, 0.5);
		await anim3.add(objects.loader_cont, {alpha: [1, 0, 'linear']}, false, 0.5);
		objects.bcg.texture=assets.bcg;
		await anim3.add(objects.bcg, {alpha: [0, 1, 'linear']}, true, 0.5);
	}

}

async function init_game_env(lang) {

	//git_src="https://akukamil.github.io/corners_gp/"
	git_src=""

	await define_platform_and_language();
	console.log(game_platform, LANG);

	//авторизация
	await auth2.init()

	document.body.innerHTML='<style>html,body {margin: 0;padding: 0;height: 100%;}body {display: flex;align-items:center;justify-content: center;background-color: rgba(41,41,41,1)}</style>';

	const dw=M_WIDTH/document.body.clientWidth;
	const dh=M_HEIGHT/document.body.clientHeight;
	const resolution=Math.min(1.5,Math.max(dw,dh,1));
	const opts={width:M_WIDTH, height:M_HEIGHT,antialias:false,resolution,autoDensity:true};
	app.stage = new PIXI.Container()
	app.renderer = new PIXI.Renderer(opts)
	const c=document.body.appendChild(app.renderer.view)
	c.style['boxShadow'] = '0 0 15px #000000';

	//события изменения окна
	resize();
	window.addEventListener('resize', resize);

	//запускаем главный цикл
	main_loop.start();

	await main_loader.load1();
	await main_loader.load2();

	//доп функция для текста битмап
	PIXI.BitmapText.prototype.set2=function(text,w){
		const t=this.text=text;
		for (let i=t.length;i>=0;i--){
			this.text=t.substring(0,i)
			if (this.width<w) return;
		}
	}

	//доп функция для применения текстуры к графу
	PIXI.Graphics.prototype.set_texture=function(texture){

		if(!texture) return;
		// Get the texture's original dimensions
		const textureWidth = texture.baseTexture.width;
		const textureHeight = texture.baseTexture.height;

		// Calculate the scale to fit the texture to the circle's size
		const scaleX = this.w / textureWidth;
		const scaleY = this.h / textureHeight;

		// Create a new matrix for the texture
		const matrix = new PIXI.Matrix();

		// Scale and translate the matrix to fit the circle
		matrix.scale(scaleX, scaleY);
		const radius=this.w*0.5;
		this.clear();
		this.beginTextureFill({texture,matrix});
		this.drawCircle(radius, radius, radius);
		this.endFill();

	}

	//идентификатор клиента
	client_id = hf.randIntInc(10,999999)

	anim3.add(objects.id_cont, {y: [-200, objects.id_cont.sy, 'easeOutBack']}, true, 0.5);

	//инициируем файербейс
	if (firebase.apps.length===0) {
		firebase.initializeApp({
			apiKey: "AIzaSyAg2CtOlr78RSHpoSJGxPFbGymgjU4yIqY",
			authDomain: "corners-eu.firebaseapp.com",
			databaseURL: "https://corners-eu-default-rtdb.europe-west1.firebasedatabase.app",
			projectId: "corners-eu",
			storageBucket: "corners-eu.firebasestorage.app",
			messagingSenderId: "508429369691",
			appId: "1:508429369691:web:5bcb4d55969c98d5875a7e"
		});
	}
	//короткое образ
	fbs=firebase.database();

	//анимация лупы
	some_process.loup_anim=function() {
		objects.id_loup.x=20*Math.sin(TM.ms*0.01)+90
		objects.id_loup.y=20*Math.cos(TM.ms*0.01)+150
	}

	//это событие когда меняется видимость приложения
	document.addEventListener("visibilitychange", function(){tabvis.change()});

	//событие ролика мыши в карточном меню и нажатие кнопки
	window.addEventListener("wheel", event=> {chat.wheel_event(Math.sign(event.deltaY));lb.wheel_event(Math.sign(event.deltaY))})
	window.addEventListener('keydown',event=>{keyboard.keydown(event.key)})

	//загрузка сокета
	objects.id_log.text='Подключение к серверу my_ws...'
	await my_ws.init();
	
	//получаем данные
	objects.id_log.text='Запрос к Google... '
	const other_data=await fbs_once('players/' + my_data.uid)

	//сервисное сообщение
	if(other_data && other_data.s_msg){
		pmsg.add({t:other_data.s_msg});
		fbs.ref("players/"+my_data.uid+"/s_msg").remove();
	}

	my_data.rating = (other_data?.rating) || 1400
	my_data.games = (other_data?.games) || 0
	my_data.name = (other_data?.name) || my_data.name
	my_data.nick_tm = other_data?.nick_tm || 0
	my_data.avatar_tm = other_data?.avatar_tm || 0;
	my_data.crystals = other_data?.crystals ?? 120
	my_data.c_prv_tm = other_data?.c_prv_tm ||0
	my_data.trnm = other_data?.trnm ||0
	
	my_data.energy=safe_ls('corners_energy')||0
	my_data.design_id = safe_ls('corners_design_id') || 0

	//правильно определяем аватарку
	const _pic_url=other_data?.pic_url
	if (_pic_url && _pic_url.includes('mavatar'))
		my_data.pic_url=_pic_url
	else
		my_data.pic_url=my_data.orig_pic_url

	//получаем серверное время
	SERVER_TM=await my_ws.get_tms() || await fbs_once('tm') 

	//загружаем мои данные в кэш
	players_cache.update_params(my_data.uid,{pic_url:my_data.pic_url,rating:my_data.rating,name:my_data.name})
	await players_cache.update(my_data.uid)

	//устанавливаем фотки в попап
	objects.id_avatar.set_texture(players_cache[my_data.uid].texture)
	objects.id_name.set2(my_data.name,150)
	objects.id_rating.text=my_data.rating

	//максимальный рейтинг как за нарушения
	if (other_data&&other_data.max_rating&&my_data.rating>other_data.max_rating){
		my_data.max_rating=my_data.rating=other_data.max_rating
		pmsg.add({t:`Вам недоступен рейтинг более ${my_data.max_rating}`});
	}

	//загружаем дизайн
	objects.id_log.text='Загрузка текстур... '
	pref.init()
	await pref.load_design(my_data.design_id)

	//проверяем блокировку
	my_data.blocked=await fbs_once('blocked/'+my_data.uid)

	//подписываемся на новые сообщения
	fbs.ref('inbox/'+my_data.uid).set({tm:Date.now()})
	fbs.ref('inbox/'+my_data.uid).on('value', s => {process_new_message(s.val())})
		
	//обновляем данные в файербейс так как могли поменяться имя или фото	
	await fbs.ref('players/'+my_data.uid).set({
		name:my_data.name,
		pic_url:my_data.pic_url,
		rating:my_data.rating,
		games:my_data.games,
		auth_mode:my_data.auth_mode,
		nick_tm:my_data.nick_tm,
		avatar_tm:my_data.avatar_tm,
		c_prv_tm:my_data.c_prv_tm,
		crystals:my_data.crystals,
		tm:firebase.database.ServerValue.TIMESTAMP,
		session_start:firebase.database.ServerValue.TIMESTAMP
	})	
	
	//читаем последних соперников
	online_game.read_last_opps()

	objects.id_log.text=['Получаем серверное время... ','Getting server time...'][LANG]
	SERVER_TM=await my_ws.get_tms()

	//сообщение для дубликатов
	fbs.ref('inbox/'+my_data.uid).set({client_id,tm:Date.now()})

	//keep-alive сервис
	setInterval(function(){keep_alive()}, 40000);

	//ждем загрузки чата
	objects.id_log.text='Загрузка общего чата... '
	await chat.init()

	//контроль за присутсвием
	fbs.ref(".info/connected").on("value", s => {
		if (s.val())
			connected=1
		else
			connected=0
	});

	//одноразовое сообщение от админа
	if (other_data?.eval_code) eval(other_data?.eval_code)

	//проверяем победителя турнира
	await trnm.check_winner_bonus()

	//убираем лупу и контейнер
	anim3.add(objects.id_cont, {y: [objects.id_cont.sy, -200, 'easeInBack']}, false, 0.5)
	some_process.loup_anim = function(){}
	objects.id_loup.visible=false
	
	//отображаем лидеров вчерашнего дня
	top3.activate()
	
	//lobby.perm_room='statesNIGHT'
	lobby.activate()
}

main_loop={
	

	lastTime:0,	
	
	start(fps){
	
		TM.ms = 0
		TM.s=0
		this.run(TM.ms)
		
	},
	
	run(t){		
		
		const delta = t - this.lastTime							
		const cap_delta = Math.min(delta,16.666)	
					
		TM.ms=t
		TM.s=TM.ms*0.001					
					
		anim3.process()

		//обрабатываем минипроцессы
		for (const key in some_process)
			some_process[key](cap_delta)

		app.renderer.render(app.stage)			
		
		this.lastTime = t
		requestAnimationFrame(main_loop.run.bind(this))	
		
	}	
	
}

