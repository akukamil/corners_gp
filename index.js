var M_WIDTH=800, M_HEIGHT=450;
var app,active_game, assets={},fbs, gdata={},  game, client_id, objects={}, state="",chat_path,my_role="", game_tick=0, made_moves=0, game_id=0, my_turn=0, connected = 1, LANG = 0;
var min_move_amount=0, h_state=0, game_platform="",git_src='', hidden_state_start = 0, room_name = 'states2';
g_board=[];
var players="",moving_chip=null, pending_player="",tm={}, some_process = {};
var my_data={opp_id : ''},opp_data={}, my_games_api = {};
const WIN = 1, DRAW = 0, LOSE = -1, NOSYNC = 2;

DESIGN_DATA={
	0:{name:'def',rating:0,games:0},
	1:{name:'old',rating:0,games:0},
	2:{name:'ice',rating:1500,games:1000},
	3:{name:'grass',rating:1700,games:5000},
	4:{name:'wood',rating:1900,games:15000},
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
	const info=await fbs.ref(path).once('value');
	return info.val();	
}

irnd = function(min,max) {	
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const rgb_to_hex = (r, g, b) => '0x' + [r, g, b].map(x => {
  const hex = x.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}).join('')

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
		
		this.avatar=new PIXI.Graphics();
		this.avatar.x=16;
		this.avatar.y=16;
		this.avatar.w=this.avatar.h=58.2;
		
		this.avatar_frame=new PIXI.Sprite(assets.chat_avatar_frame_img);
		this.avatar_frame.x=16-11.64;
		this.avatar_frame.y=16-11.64;
		this.avatar_frame.width=this.avatar_frame.height=81.48;
				
		this.name="";
		this.name_text=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 22,align: 'center'});
		this.name_text.anchor.set(1,0);
		this.name_text.x=180;
		this.name_text.y=20;
		this.name_text.tint=0xffffff;		

		this.rating=0;
		this.rating_text=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 30,align: 'center'});
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
		
		
		this.rating_text1=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 24,align: 'center'});
		this.rating_text1.tint=0xffff00;
		this.rating_text1.anchor.set(0.5,0);
		this.rating_text1.x=48.1;
		this.rating_text1.y=56;

		this.rating_text2=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 24,align: 'center'});
		this.rating_text2.tint=0xffff00;
		this.rating_text2.anchor.set(0.5,0);
		this.rating_text2.x=150.1;
		this.rating_text2.y=56;		
		
		this.name1="";
		this.name2="";

		this.addChild(this.bcg,this.avatar,this.avatar_frame,this.avatar1, this.avatar1_frame, this.avatar2,this.avatar2_frame,this.rating_text,this.table_rating_hl,this.rating_text1,this.rating_text2, this.name_text);
	}

}

class lb_player_card_class extends PIXI.Container{

	constructor(x,y,place) {
		super();

		this.bcg=new PIXI.Sprite(assets.lb_player_card_bcg);
		this.bcg.interactive=true;
		this.bcg.pointerover=function(){this.tint=0x55ffff};
		this.bcg.pointerout=function(){this.tint=0xffffff};
		this.bcg.width = 370;
		this.bcg.height = 70;

		this.place=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.place.tint=0xffff00;
		this.place.x=20;
		this.place.y=22;

		this.avatar=new PIXI.Sprite();
		this.avatar.x=43;
		this.avatar.y=12;
		this.avatar.width=this.avatar.height=45;


		this.name=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.name.tint=0xdddddd;
		this.name.x=105;
		this.name.y=22;


		this.rating=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.rating.x=298;
		this.rating.tint=rgb_to_hex(255,242,204);
		this.rating.y=22;

		this.addChild(this.bcg,this.place, this.avatar, this.name, this.rating);
	}


}

class chat_record_class extends PIXI.Container {
	
	constructor() {
		
		super();
		
		this.tm=0;
		this.index=0;
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
		
		this.name = new PIXI.BitmapText('Имя Фамил', {fontName: 'mfont',fontSize: 17});
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
		
		this.msg = new PIXI.BitmapText('Имя Фамил', {fontName: 'mfont',fontSize: 19,lineSpacing:55,align: 'left'}); 
		this.msg.x=this.avatar.x+75;
		this.msg.y=this.avatar.y+30;
		this.msg.maxWidth=450;
		this.msg.anchor.set(0,0.5);
		this.msg.tint = 0xffffff;
		
		this.msg_tm = new PIXI.BitmapText('28.11.22 12:31', {fontName: 'mfont',fontSize: 15}); 		
		this.msg_tm.tint=0xffffff;
		this.msg_tm.alpha=0.6;
		this.msg_tm.anchor.set(1,0);
		
		this.visible = false;
		this.addChild(this.msg_bcg,this.gif_bcg,this.gif,this.avatar_bcg,this.avatar,this.avatar_frame,this.name,this.msg,this.msg_tm);
		
	}
		
	nameToColor(name) {
		  // Create a hash from the name
		  let hash = 0;
		  for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
			hash = hash & hash; // Convert to 32bit integer
		  }

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
		
	async update_avatar(uid, tar_sprite) {		
	
		//определяем pic_url
		await players_cache.update(uid);
		await players_cache.update_avatar(uid);
		tar_sprite.set_texture(players_cache.players[uid].texture);	
	}
	
	async set(msg_data) {
						
		//получаем pic_url из фб
		this.avatar.set_texture(PIXI.Texture.WHITE);
				
		await this.update_avatar(msg_data.uid, this.avatar);

		this.uid=msg_data.uid;
		this.tm = msg_data.tm;			
		this.index = msg_data.index;		
		
		this.name.set2(msg_data.name,150);
		this.name.tint=this.nameToColor(msg_data.name);
		this.msg_tm.text = new Date(msg_data.tm).toLocaleString();
		this.msg.text=msg_data.msg;
		this.visible = true;
		
		if (msg_data.msg.startsWith('GIF')){			
			
			const mp4BaseT=await new Promise((resolve, reject)=>{
				const baseTexture = PIXI.BaseTexture.from('https://akukamil.github.io/common/gifs/'+msg_data.msg+'.mp4');
				if (baseTexture.width>1) resolve(baseTexture);
				baseTexture.on('loaded', () => resolve(baseTexture));
				baseTexture.on('error', (error) => resolve(null));
			});
			
			if (!mp4BaseT) {
				this.visible=false;
				return 0;
			}
			
			mp4BaseT.resource.source.play();
			mp4BaseT.resource.source.loop=true;
			
			this.gif.texture=PIXI.Texture.from(mp4BaseT);
			this.gif.visible=true;	
			const aspect_ratio=mp4BaseT.width/mp4BaseT.height;
			this.gif.height=90;
			this.gif.width=this.gif.height*aspect_ratio;
			this.msg_bcg.visible=false;
			this.msg.visible=false;
			this.msg_tm.anchor.set(0,0);
			this.msg_tm.y=this.gif.height+9;
			this.msg_tm.x=this.gif.width+102;
			
			this.gif_bcg.visible=true;
			this.gif_bcg.height=this.gif.height;
			this.gif_bcg.width=	this.gif.width;
			return this.gif.height+30;
			
		}else{
			
			this.gif_bcg.visible=false;
			this.gif.visible=false;	
			this.msg_bcg.visible=true;
			this.msg.visible=true;
			
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
		this.text=new PIXI.BitmapText('Николай: хорошая игра', {fontName: 'mfont',fontSize: 22,align: 'left',lineSpacing:45}); 
		this.text.maxWidth=290;
		this.text.tint=0xFFFF00;
		
		this.name_text=new PIXI.BitmapText('Николай:', {fontName: 'mfont',fontSize: 22,align: 'left'}); 
		this.name_text.tint=0xFFFFFF;
		
		
		this.addChild(this.text,this.name_text)
	}		
	
	set(name, feedback_text){
		this.text.text=name+': '+feedback_text;
		this.name_text.text=name+':';
	
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

anim2 = {
		
	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	empty_spr : {x:0, visible:false, ready:true, alpha:0},
		
	slot: Array(30).fill(null),
		
	
	any_on() {		
		for (let s of this.slot)
			if (s !== null&&s.block)
				return true
		return false;			
	},
	
	linear(x) {
		return x
	},
	
	kill_anim(obj) {
		
		for (var i=0;i<this.slot.length;i++)
			if (this.slot[i]!==null)
				if (this.slot[i].obj===obj){
					this.slot[i].p_resolve('finished');		
					this.slot[i].obj.ready=true;					
					this.slot[i]=null;	
				}
	
	},
	
	flick(x){
		
		return Math.abs(Math.sin(x*6.5*3.141593));
		
	},
	
	easeBridge(x){
		
		if(x<0.1)
			return x*10;
		if(x>0.9)
			return (1-x)*10;
		return 1		
	},
	
	ease3peaks(x){

		if (x < 0.2)
			return 1;
		if (x >= 0.2&&x<0.4)
			return 0;
		if (x >= 0.4&&x<0.6)
			return 1;
		if (x >= 0.6&&x<0.8)
			return 0;
		if (x >= 0.8)
			return 1;		
	},
	
	easeTwiceBlink(x){
		
		if(x<0.333)
			return 1;
		if(x>0.666)
			return 1;
		return 0		
	},
	
	easeOutBack(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},
	
	easeOutBack2(x) {
		return -5.875*Math.pow(x, 2)+6.875*x;
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
	
	easeOutCubic(x) {
		return 1 - Math.pow(1 - x, 3);
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
	
	ease2back(x) {
		return Math.sin(x*Math.PI);
	},
	
	easeInOutCubic(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	
	shake(x) {
		
		return Math.sin(x*2 * Math.PI);	
		
	},	
	
	add (obj, params, vis_on_end, time, func, block=true) {
				
		//если уже идет анимация данного спрайта то отменяем ее
		anim2.kill_anim(obj);

		let f=0;
		//ищем свободный слот для анимации
		for (var i = 0; i < this.slot.length; i++) {

			if (this.slot[i] === null) {
				
				obj.visible = true;
				obj.ready = false;

				//добавляем дельту к параметрам и устанавливаем начальное положение
				for (let key in params) {
					params[key][2]=params[key][1]-params[key][0];					
					obj[key]=params[key][0];
				}
				
				//для возвратных функцие конечное значение равно начальному
				if (func === 'ease2back' || func === 'shake' || func === 'ease3peaks')
					for (let key in params)
						params[key][1]=params[key][0];				
					
				this.slot[i] = {
					obj,
					block,
					params,
					vis_on_end,
					func: this[func].bind(anim2),
					speed: 0.01818 / time,
					progress: 0
				};
				f = 1;
				break;
			}
		}
		
		if (f===0) {
			console.log("Кончились слоты анимации");	
			
			
			//сразу записываем конечные параметры анимации
			for (let key in params)				
				obj[key]=params[key][1];			
			obj.visible=vis_on_end;
			obj.alpha = 1;
			obj.ready=true;
			
			
			return new Promise(function(resolve, reject){					
			  resolve();	  		  
			});	
		}
		else {
			return new Promise(function(resolve, reject){					
			  anim2.slot[i].p_resolve = resolve;	  		  
			});			
			
		}

		
		

	},	
		
	process() {
		
		for (var i = 0; i < this.slot.length; i++)
		{
			if (this.slot[i] !== null) {
				
				let s=this.slot[i];
				
				s.progress+=s.speed;		
				
				for (let key in s.params)				
					s.obj[key]=s.params[key][0]+s.params[key][2]*s.func(s.progress);		
				
				//если анимация завершилась то удаляем слот
				if (s.progress>=0.999) {
					for (let key in s.params)				
						s.obj[key]=s.params[key][1];
									
					s.obj.visible=s.vis_on_end;
					if (s.vis_on_end === false)
						s.obj.alpha = 1;
					
					s.obj.ready=true;					
					s.p_resolve('finished');
					this.slot[i] = null;
				}
			}			
		}
		
	},
	
	async wait(time) {
		
		await this.add(this.empty_spr,{x:[0, 1]}, false, time,'linear');	
		
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
		anim2.add(objects.pref_info,{alpha:[0,1]}, false, 3,'easeBridge',false);		
		
	}
	
}

message =  {
	
	promise_resolve :0,
	
	async add(text, timeout=3000,sound_name='message') {
		
		if (this.promise_resolve!==0)
			this.promise_resolve("forced");
		
		
		//воспроизводим звук
		sound.play(sound_name);

		objects.message_text.text=text;

		await anim2.add(objects.message_cont,{x:[-200,objects.message_cont.sx]}, true, 0.25,'easeOutBack',false);

		let res = await new Promise((resolve, reject) => {
				message.promise_resolve = resolve;
				setTimeout(resolve, timeout)
			}
		);
		
		if (res === "forced")
			return;

		anim2.add(objects.message_cont,{x:[objects.message_cont.sx, -200]}, false, 0.25,'easeInBack',false);			
	},
	
	clicked() {
		
		
		message.promise_resolve();
		
	}

}

big_message = {
	
	p_resolve : 0,
	feedback_on : 0,	
		
	show(t1,t2, feedback_on) {
		
		this.feedback_on = feedback_on;
				
		if (t2!==undefined || t2!=="")
			objects.big_message_text2.text=t2;
		else
			objects.big_message_text2.text='**********';

		objects.feedback_button.visible = feedback_on&&!my_data.blocked;
		objects.big_message_text.text=t1;
		anim2.add(objects.big_message_cont,{y:[-180,objects.big_message_cont.sy]}, true, 0.6,'easeOutBack');		
				
		return new Promise(function(resolve, reject){					
			big_message.p_resolve = resolve;	  		  
		});
	},

	async feedback_down() {
		
		if (anim2.any_on()){
			sound.play('locked');
			return;			
		}

		sound.play('click');	

		anim2.add(objects.big_message_cont,{y:[objects.big_message_cont.sy,450]}, false, 0.4,'easeInBack');	
		
		//пишем отзыв и отправляем его		
		const msg = await keyboard.read();		
		if (msg) {
			let fb_id = irnd(0,50);			
			await fbs.ref('fb/'+opp_data.uid+'/'+fb_id).set([msg, firebase.database.ServerValue.TIMESTAMP, my_data.name]);
		}
		
		this.p_resolve('close');
				
	},

	close() {
		
		if (anim2.any_on()){
			sound.play('locked');
			return;			
		}

		sound.play('click');		
		
		anim2.add(objects.big_message_cont,{y:[objects.big_message_cont.sy,450]}, false, 0.4,'easeInBack');		
		this.p_resolve("close");			
	}

}

board_func={

	checker_to_move:'',
	target_point:0,
	chips_tex:[0,0,0],
	moves:[],
	base64:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789()',
	
	move_end_callback(){},

	update_board(board) {

		this.target_point=0;

		//сначала скрываем все шашки
		objects.checkers.forEach(c=>{c.visible=false});

		var ind=0;
		for (let x=0;x<8;x++) {
			for (let y=0;y<8;y++) {
				
				const chip_id=board[y][x];
				if (chip_id){

					objects.checkers[ind].x=x*50+objects.board.x+30;
					objects.checkers[ind].y=y*50+objects.board.y+30;

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

		let g_archive=[0,0,0,0,0,0,0,0,0,0,0];
		let move_archive=[[move_data.x1,move_data.y1]];


		function left(move_data,cur_board, m_archive) {

			var new_x=move_data.x1-1;
			var new_y=move_data.y1;

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
			var new_x=move_data.x1+1;
			var new_y=move_data.y1;

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
			var new_x=move_data.x1;
			var new_y=move_data.y1-1;

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
			var new_x=move_data.x1;
			var new_y=move_data.y1+1;

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

			var new_x=move_data.x1-2;
			var new_y=move_data.y1;

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

			var new_x=move_data.x1+2;
			var new_y=move_data.y1;

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

			var new_x=move_data.x1;
			var new_y=move_data.y1-2;

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

			var new_x=move_data.x1;
			var new_y=move_data.y1+2;

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
				
		if (!document.hidden){
			for (let i = 1 ; i < moves.length; i++) {			
				let tar_x = moves[i][0] * 50 + objects.board.x+30;
				let tar_y = moves[i][1] * 50 + objects.board.y+30;
				await anim2.add(moving_chip,{x:[moving_chip.x, tar_x], y: [moving_chip.y, tar_y]}, true, 0.16,'linear');
				sound.play('move');
			}		
		}
		
		moving_chip.ready=true;
		
		const [sx,sy]=moves[0];
		const [tx,ty]=moves[moves.length-1];

		//меняем старую и новую позицию шашки
		[board[ty][tx],board[sy][sx]]=[board[sy][sx],board[ty][tx]];

		//обновляем доску
		this.update_board(board);

	},

	set_next_cell() {

		//проверяем что движение завершилось
		if (this.target_point===this.moves.length) {

			this.target_point=0;

			var [sx,sy]=this.moves[0];
			var [tx,ty]=this.moves[this.moves.length-1];

			//меняем старую и новую позицию шашки
			[g_board[ty][tx],g_board[sy][sx]]=[g_board[sy][sx],g_board[ty][tx]];

			//обновляем доску
			board_func.update_board(g_board);

			//вызываем функцию которая обозначает завершение движения шашки
			this.move_end_callback();

			return;
		}



		var [next_ix,next_iy]=this.moves[this.target_point];

		this.checker_to_move.tx=next_ix*50+objects.board.x+20;
		this.checker_to_move.ty=next_iy*50+objects.board.y+20;

		this.checker_to_move.dx=(this.checker_to_move.tx-this.checker_to_move.x)/10;
		this.checker_to_move.dy=(this.checker_to_move.ty-this.checker_to_move.y)/10;

		this.target_point++;
	},

	brd_to_str(boardv,move){
		
		//кодируем доску в символы base64
		let b_str=''
		for (let p=1;p<=2;p++)
			for (let y=0;y<8;y++)
				for (let x=0;x<8;x++)
					if (boardv[y][x]===p)
						b_str+=this.base64[x+y*8];
					
		if (move) b_str+=move
		return b_str;			
	},

	str_to_brd(str){
		
		const t_board =[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];

		//декодируем строку в доску
		for (i=0;i<24;i++){
			const ind=this.base64.indexOf(str[i]);
			const y=Math.floor(ind/8);
			const x=ind%8;
			t_board[y][x]=1+(i>=12);			
		}		
		return t_board;
	},
	
	str_to_quiz_brd(str){
		
		const t_board =[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];

		//декодируем строку в доску
		const len=str.length;
		for (i=0;i<len;i++){
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

	count_finished1(boardv) {
		let cnt=0;
		for (var y=0;y<3;y++)
			for (var x=0;x<4;x++)
				if (boardv[y][x]===1)
					cnt++;
		return cnt;
	},

	count_finished2(boardv) {
		let cnt=0;
		for (var y=5;y<8;y++)
			for (var x=4;x<8;x++)
				if (boardv[y][x]===2)
					cnt++;
		return cnt;
	},

	finished1(boardv) {
		for (var y=0;y<3;y++)
			for (var x=0;x<4;x++)
				if (boardv[y][x]!==1)
					return 0;
		return 1;
	},

	finished2(boardv) {
		for (var y=5;y<8;y++)
			for (var x=4;x<8;x++)
				if (boardv[y][x]!==2)
					return 0;
		return 1;
	},

	any1home(boardv) {
		for (var y=5;y<8;y++)
			for (var x=4;x<8;x++)
				if (boardv[y][x]===1)
					return 1;
		return 0;
	},

	any2home(boardv) {
		for (var y=0;y<3;y++)
			for (var x=0;x<4;x++)
				if (boardv[y][x]===2)
					return 1;
		return 0;
	},

	get_board_state(board, made_moves) {

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

online_game = {
	
	name : 'online',
	start_time : 0,
	disconnect_time : 0,
	me_conf_play : 0,
	opp_conf_play : 0,
	time_for_move:0,
	timer_id : 0,
	prv_tick_time:0,
	chat_incoming:1,
	chat_active:1,
	
	calc_new_rating(old_rating, game_result) {
		
		
		if (game_result === NOSYNC)
			return old_rating;
		
		//не авторизованым игрокам нельзя выиграть более 2000
		if (my_data.rating>2000&&!my_data.auth_mode&&game_result === WIN)
			return old_rating;	
		
		var Ea = 1 / (1 + Math.pow(10, ((opp_data.rating-my_data.rating)/400)));
		if (game_result === WIN)
			return Math.round(my_data.rating + 16 * (1 - Ea));
		if (game_result === DRAW)
			return Math.round(my_data.rating + 16 * (0.5 - Ea));
		if (game_result === LOSE)
			return Math.round(my_data.rating + 16 * (0 - Ea));
		
	},
	
	activate() {
		
		my_log.log_arr=[];
		
		//пока еще никто не подтвердил игру
		this.me_conf_play = 0;
		this.opp_conf_play = 0;
		
		//счетчик времени
		this.prv_tick_time=Date.now();
		this.timer_start_time=Date.now();
		this.time_for_move = 15;
		this.timer_id = setTimeout(function(){online_game.timer_tick()}, 1000);
		objects.timer_text.tint=0xffffff;
		
		//отображаем таймер
		objects.timer_cont.visible = true;
		objects.game_buttons_cont.visible = true;
		objects.timer_cont.x = my_turn === 1 ? 30 : 630;
		
		//фиксируем врему начала игры
		this.start_time = Date.now();

		//обновляем стол
		fbs.ref('tables/'+game_id+'/master').set(my_data.uid);
		fbs.ref('tables/'+game_id+'/slave').set(opp_data.uid);
		
		//вычиcляем рейтинг при проигрыше и устанавливаем его в базу он потом изменится
		let lose_rating = this.calc_new_rating(my_data.rating, LOSE);
		if (lose_rating >100 && lose_rating<9999)
			this.update_my_rating_fbs(lose_rating);
		
		//возможность чата
		this.chat_out=1;
		this.chat_in=1;
		objects.no_chat_button.alpha=1;
		objects.send_message_button.alpha=my_data.blocked?0.3:1;
		
		//устанавливаем локальный и удаленный статус
		set_state({state : 'p'});		
		
		//устанавливаем начальное расположение шашек
		g_board =[[2,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1]];
		board_func.update_board(g_board);
		
		
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
			message.add('Вы не можете писать в чат, так как вы находитесь в черном списке');
			sound.play('locked');
			return;	
		} 	

		
		sound.play('click');
		const msg=await keyboard.read();

		if (msg) fbs.ref('inbox/'+opp_data.uid).set({sender:my_data.uid,message:'CHAT',tm:Date.now(),data:msg});
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
		message.add(['Вы отключили чат','Chat disabled'][LANG]);
	},
	
	chat(data) {
		if (!this.chat_in) return;
		message.add(data, 10000,'online_message');
		
		my_log.add({name:my_data.name,opp_name:opp_data.name,game_id,connected,tm:Date.now(),info:'in_chat',chat:data})
	},
	
	nochat(){
		
		this.chat_out=0;
		objects.send_message_button.alpha=0.3;
		message.add(['Соперник отключил чат','Chat disabled'][LANG]);
	},
		
	update_my_rating_fbs(rating){
		
		fbs.ref('players/'+my_data.uid+'/rating').set(rating||my_data.rating);
		//fbs.ref('pdata/'+my_data.uid+'/PUB/rating').set(rating||my_data.rating);
		//fbs.ref('pdata/'+my_data.uid+'/rating').set(rating||my_data.rating);
		
	},
		
	async forced_inbox_check(game_id,opp_name){
				
		let c_data=await fbs.ref('inbox/'+my_data.uid).once('value');
		c_data=c_data.val();
		fbs.ref('BAD_CASE2').push({name:my_data.name,opp_name,game_id,info:'forced_inbox_check',tm:Date.now(),inbox:c_data});
		
	},
		
	async stop (result) {
		
		const res_array = [
			['my_timeout',LOSE, ['Вы проиграли!\nУ вас закончилось время','You lose!\nOut of time!']],
			['opp_timeout',WIN , ['Вы выиграли!\nУ соперника закончилось время','You win!\nOpponent out of time']],
			['my_giveup' ,LOSE, ['Вы сдались!','You have given up!']],
			['timer_error' ,LOSE, ['Ошибка таймера!','Timer error!']],
			['opp_giveup' ,WIN , ['Вы выиграли!\nСоперник сдался','You win!\nYour opponent has given up!']],
			['both_finished',DRAW, ['Ничья','Draw!']],
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
		
		let result_row = res_array.find( p => p[0] === result);
		let result_str = result_row[0];
		let result_number = result_row[1];
		let result_info = result_row[2][LANG];				
		let old_rating = my_data.rating;
		my_data.rating = this.calc_new_rating (my_data.rating, result_number);
		this.update_my_rating_fbs();
		
		//обновляем даные на карточке
		objects.my_card_rating.text=my_data.rating;
		
		//если диалоги еще открыты
		if (objects.stickers_cont.visible===true)
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

		//также фиксируем данные стола
		setTimeout(()=>{
		fbs.ref('tables/'+game_id+'/board').set({uid:my_data.uid,fin:result,tm:Date.now()});			
		},400)

		
		//если игра результативна то записываем дополнительные данные
		if (result_number === DRAW || result_number === LOSE || result_number === WIN) {
			
			//увеличиваем количество игр
			my_data.games++;
			fbs.ref('players/'+my_data.uid+'/games').set(my_data.games);		
	
			//записываем результат в базу данных
			const duration = ~~((Date.now() - this.start_time)*0.001);
			fbs.ref('finishes/'+game_id).set({player1:objects.my_card_name.text,player2:objects.opp_card_name.text, res:result_number,fin_type:result_str,duration,rating: [old_rating,my_data.rating],client_id, ts:firebase.database.ServerValue.TIMESTAMP});
			
			//записываем дату последней игры
			fbs.ref('players/'+my_data.uid+'/last_game_tm').set(firebase.database.ServerValue.TIMESTAMP);		
			
			//контрольные концовки
			if (my_data.rating>2130 || opp_data.rating>2130)
				fbs.ref('finishes2/'+irnd(1,999999)).set({uid:my_data.uid,player1:objects.my_card_name.text,player2:objects.opp_card_name.text, res:result_number,fin_type:result_str,duration, rating: [old_rating,my_data.rating],client_id, ts:firebase.database.ServerValue.TIMESTAMP});	
						
		}
		
		
		await big_message.show(result_info, `${['Рейтинг: ','Rating: '][LANG]} ${old_rating} > ${my_data.rating}`,true)
		
	},
	
	clear() {
		
		
	}
	
}

bot_game = {

	name :'bot',
	me_conf_play : 0,
	opp_conf_play : 0,

	activate() {

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

		board_func.update_board(g_board);		

	},

	async stop(result) {


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
		objects.stop_bot_button.visible = false;
		
		//отключаем взаимодейтсвие с доской
		objects.board.pointerdown = function() {};
		
		//воспроизводим звук
		if (result_number === DRAW || result_number === LOSE)
			sound.play('lose');
		else
			sound.play('win');		
		
		await big_message.show(result_info, ')))',true)
		
	},

	async make_move() {

		await new Promise((resolve, reject) => setTimeout(resolve, 300));

		let m_data={};
		if (made_moves < 30)
			m_data=minimax_solver.minimax_3(g_board, made_moves);
		else 
			m_data=minimax_solver.minimax_3_single(g_board, made_moves);

		game.receive_move(m_data);	

	},
	
	reset_timer() {
		
		
	},
	
	clear() {
		
		//выключаем элементы
		objects.stop_bot_button.visible = false;
		
	}

}

quiz={
	
	make_moves:0,
	made_moves_leader:999,
	accepted_leader:'',	
	prv_quiz_read:0,
	quiz_data:0,
	on:0,
	path:'quiz6',
	board_loaded:0,
	moves_hist:[],
	init_board:[
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,1,1,1,1],
		[0,0,0,0,1,1,1,1],
		[0,0,0,0,1,1,1,1]
	],
	
	bonuses_points:[
		{y:3,x:0},
		{y:7,x:1},
		{y:2,x:5},
		{y:0,x:6},
		{y:2,x:7},
	],	
	
	activate(){
				
		game.opponent=quiz;
		this.on=1;
		this.moves_hist=[];
		
		//убираем все чтобы играть не могли
		objects.checkers.forEach(c=>{c.visible=false});
		
		//устанавливаем локальный и удаленный статус
		set_state ({state:'b'});
		
		//таймер уже не нужен
		objects.timer_cont.visible = false;
		objects.game_buttons_cont.visible = false;
		objects.stop_bot_button.visible = true;
		objects.quiz_reload_btn.visible = true;

		//показываем и заполняем мою карточку	
		objects.my_card_name.set2(my_data.name,110);
		objects.my_card_rating.visible=true;
		objects.my_avatar.texture=players_cache.players[my_data.uid].texture;	
		anim2.add(objects.my_card_cont,{x:[-100, objects.my_card_cont.sx],alpha:[0,1]}, true, 0.5,'linear');	

		//обновляем карточку лидера
		this.update_leader();

		//устанаваем вид моих и чужих фишек в зависимости у кого первый ход и текущего дизайна
		board_func.chips_tex[1]=pref.chips[2-my_turn].texture;
		board_func.chips_tex[2]=pref.chips[1+my_turn].texture;	

		//основные элементы игры
		objects.board_cont.visible=true;
		objects.my_card_cont.visible=true;
		objects.opp_card_cont.visible=false;			
		objects.board.interactive=false;
	
		this.made_moves=0;
		objects.cur_move_text.visible=true;
		objects.cur_move_text.text=['Загрузка...','Loading...'][LANG];
		
		//устанаваем текстуру
		objects.board.texture=pref.board_texture;		
		
	},
	
	getHodText(n) {
	  const lastDigit = n % 10;
	  const lastTwoDigits = n % 100;

	  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
		return `${n} ходов`;
	  }

	  switch (lastDigit) {
		case 1:
		  return `${n} ход`;
		case 2:
		case 3:
		case 4:
		  return `${n} хода`;
		default:
		  return `${n} ходов`;
	  }
	},

	async update_leader(){
				
		//обновляем только если 5 минут прошло
		const tm=Date.now();
		if (tm-this.prv_quiz_read>300000)
			this.quiz_data=await fbs_once(this.path);
				
		if (!this.quiz_data){
			objects.cur_move_text.text=['Ошибка при загрузке!','Loading error!'][LANG];
			return;		
		}
		
		await players_cache.update(this.quiz_data.cur_leader,{});
		await players_cache.update_avatar(this.quiz_data.cur_leader);		
		const cur_leader_data=players_cache.players[this.quiz_data.cur_leader];
	
		
		//если уже выключили игру
		if (!this.on) return;
		
		game.move_processor=this.process_my_move.bind(quiz);
		objects.board.pointerdown = game.mouse_down_on_board.bind(game);
		objects.board.interactive=true;
				
		objects.cur_move_text.text='Сделано ходов: '+this.made_moves;
		
		//очереди
		my_turn=1;
		
		//сколько ходов сделал лидер
		this.made_moves_leader=this.quiz_data.moves;
				
		//заполняем данные лидера
		objects.opp_card_name.set2(cur_leader_data.name,110);
		objects.opp_card_rating.text=this.getHodText(this.quiz_data.moves);		
		objects.opp_avatar.texture=players_cache.players[this.quiz_data.cur_leader].texture;	
		
		//показываем карточку лидера
		anim2.add(objects.opp_card_cont,{x:[800, objects.opp_card_cont.sx],alpha:[0,1]}, true, 0.5,'linear');		
		objects.opp_avatar_frame.texture=assets.leader_avatar_frame;
		
		//правила				
		if (this.quiz_data.accepted_leader){
			objects.t_quiz_rules.text='';
			objects.quiz_rules_bcg.texture=assets.quiz_complete;				
		} else {
			objects.t_quiz_rules.text=`Собери звезды и переведи все шашки в новый дом быстрее всех. Победитель получит кастомную карточку. Подведение итогов 30.12.2024`;
			objects.quiz_rules_bcg.texture=assets.quiz_rules_bcg;		
		}
		anim2.add(objects.quiz_rules_cont,{x:[-100, objects.quiz_rules_cont.sx]}, true, 0.25,'easeOutBack');	
		
		this.restart();
			
	},
	
	stop(){
				
		this.clear();
		
	},
	
	restart(){
		
		//инициируем вид доски
		g_board=JSON.parse(JSON.stringify(this.init_board));
		board_func.update_board(g_board);		
		
		this.made_moves=0;
		objects.cur_move_text.text='Сделано ходов: '+this.made_moves;
		
		for (let i=0;i<this.bonuses_points.length;i++){		

			const bonus=this.bonuses_points[i];
			
			//показываем точки взятия
			objects.bonuses[i].x=bonus.x*50+objects.board.x+55;
			objects.bonuses[i].y=bonus.y*50+objects.board.y+55;
			objects.bonuses[i].visible=true;
			objects.bonuses[i].texture=assets.bonus_star;	
			objects.bonuses[i].angle=0;
			objects.bonuses[i].alpha=1;
			objects.bonuses[i].scale_xy=0.666;
			objects.bonuses[i].ix=bonus.x;
			objects.bonuses[i].iy=bonus.y;
			objects.bonuses[i].taken=0;
		}	
		
	},
	
	clear(){
		
		//выключаем элементы
		this.on=0;
		objects.stop_bot_button.visible = false;
		objects.quiz_rules_cont.visible=false;
		objects.bonuses.forEach(b=>b.visible=false);
		objects.quiz_reload_btn.visible = false;
		
	},
	
	make_new_quiz(){		
					
		const quiz_data={moves:99,cur_leader:'debug99'};
		fbs.ref(this.path).set(quiz_data);
		
	},
	
	async process_my_move(move_data, moves){
						
		this.moves_hist.push(move_data);
				
		//делаем перемещение шашки
		await board_func.start_gentle_move(move_data, moves, g_board);	
				
		let bonuses_taken_num=0;
		for (let i=0;i<this.bonuses_points.length;i++){		
			
			const bonus=objects.bonuses[i];
			
			if (bonus.taken)
				bonuses_taken_num++;
			
			if (bonus.visible){
				
				const intersect=moves.find(m=>{
					return m[0]===bonus.ix&&m[1]===bonus.iy
				})
				
				if (intersect){
					sound.play('bonus');
					anim2.add(bonus,{scale_xy:[0.6666,2],angle:[0,40],alpha:[1,0]}, false, 0.5,'linear',false);
					bonus.taken=1;					
				}
			}			
		}
				
		this.made_moves++;
		objects.cur_move_text.text='Сделано ходов: '+this.made_moves;
		objects.my_card_rating.text=this.getHodText(this.made_moves);	

		
		//проверка завершения
		if (bonuses_taken_num===this.bonuses_points.length&&board_func.finished1(g_board)){
			my_turn=0;			
			objects.stop_bot_button.visible = false;
				
			
			if (this.accepted_leader){				
				await big_message.show('Конкурс завершен!', `сделано ходов: ${this.made_moves}`,false);	
				sound.play('lose');				
			}else{
				if (this.made_moves<this.made_moves_leader){
					
					
					fbs.ref(this.path+'/cur_leader').set(my_data.uid);
					fbs.ref(this.path+'/moves').set(this.made_moves);
					fbs.ref(this.path+'/moves_hist').set(this.moves_hist);
					sound.play('win');
					await big_message.show('Вы теперь лидер!', `сделано ходов: ${this.made_moves}`,false);
					this.prv_quiz_read=0;
					
					
					
				}else{
					
					if (this.made_moves===this.made_moves_leader)
						await big_message.show('Вы не смогли обойти лидера!', `сделано ходов: ${this.made_moves}`,false);
					else
						await big_message.show('Вы проиграли лидеру!', `сделано ходов: ${this.made_moves}`,false);
					
					sound.play('lose');					
				}				
			}		
			
			quiz.activate();
		}
		
	},
	
	close(){
		
		
	}	
}

game = {

	opponent : '',
	selected_checker : 0,
	state : 0,
	move_processor:0,

	activate(opponent, role) {

		my_role = role;
		
		objects.bcg.texture=assets.bcg;
		anim2.add(objects.bcg,{alpha:[0,1]}, true, 0.5,'linear');	
		
		this.state = 'on';

		if (role==='master') {
			my_turn=1;		
			message.add(['Ваши шашки в нижнем правом углу. Последний ход за соперником','Ready to play. The last move for the opponent'][LANG])
		} else {
			my_turn=0;
			message.add(['Ваши шашки в нижнем правом углу. Последний ход за вами','Ready to play. The last move is yours'][LANG])
		}
		
		//устанаваем вид моих и чужих фишек в зависимости у кого первый ход и текущего дизайна
		board_func.chips_tex[1]=pref.chips[2-my_turn].texture;
		board_func.chips_tex[2]=pref.chips[1+my_turn].texture;		
		
		//устанаваем текстуру
		objects.board.texture=pref.board_texture;

		if (this.opponent!=='') this.opponent.clear();
		
		//если открыт лидерборд то закрываем его
		if (objects.lb_1_cont.visible===true) lb.close();
		
		//если открыт чат то закрываем его
		if (objects.chat_cont.visible) chat.close();
		
		//если открыт просмтотр игры то закрываем его
		if (game_watching.on) game_watching.close();		
		
		this.opponent=opponent;
		this.opponent.activate();
		this.move_processor=this.process_my_move;
		
		//показываем и заполняем мою карточку	
		objects.my_card_name.set2(my_data.name,110);
		objects.my_card_rating.text=my_data.rating;
		objects.my_card_rating.visible=true;
		objects.my_avatar.texture=players_cache.players[my_data.uid].texture;	
		anim2.add(objects.my_card_cont,{x:[-100, objects.my_card_cont.sx],alpha:[0,1]}, true, 0.5,'linear');	
		
		objects.opp_card_name.set2(opp_data.name,110);
		objects.opp_card_rating.text=opp_data.rating;
		objects.opp_avatar_frame.texture=assets.avatar_frame;
		objects.opp_avatar.texture=players_cache.players[opp_data.uid].texture;	
		anim2.add(objects.opp_card_cont,{x:[800, objects.opp_card_cont.sx],alpha:[0,1]}, true, 0.5,'linear');	
					
		sound.play('note');

		//это если перешли из бот игры
		this.selected_checker=0;
		objects.selected_frame.visible=false;

		//основные элементы игры
		objects.board_cont.visible=true;
		objects.my_card_cont.visible=true;
		objects.opp_card_cont.visible=true;		
		
		objects.cur_move_text.visible=true;

		//обозначаем какой сейчас ход
		made_moves=0;
		objects.cur_move_text.text=['Ход: ','Move: '][LANG]+made_moves;

		//включаем взаимодейтсвие с доской
		objects.board.pointerdown = game.mouse_down_on_board.bind(game);
		objects.board.interactive=true;
		

	},

	timer_tick() {



	},

	async give_up_down() {
		
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};
		
		if (made_moves <5 ) {
			message.add(['Нельзя сдаваться в начале игры','Can not giveup in beginning'][LANG]);		
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

		if (anim2.any_on()) {
			sound.play('locked');
			return
		};

		//проверяем что моя очередь
		if (!my_turn) {
			message.add(["Не твоя очередь","Not your turn"][LANG]);
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
			this.selected_checker=board_func.get_checker_by_pos(new_x,new_y,objects.checkers);

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
				message.add(["Это не ваши шашки","Not your checkers"][LANG]);
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
			const moves=board_func.get_moves_path(m_data,g_board);


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
				message.add(["Так нельзя ходить","Invalid move"][LANG]);
			}
		}

	},

	async process_my_move(move_data, moves) {
		
		//делаем перемещение шашки
		await board_func.start_gentle_move(move_data, moves, g_board);	
		
		//начинаем процесс плавного перемещения шашки
		if (state === 'b') {					
			bot_game.make_move();
		} else {
			//переворачиваем данные о ходе так как оппоненту они должны попасть как ход шашками №2
			move_data.x1=7-move_data.x1;
			move_data.y1=7-move_data.y1;
			move_data.x2=7-move_data.x2;
			move_data.y2=7-move_data.y2;
			const move_data_short=move_data.x1.toString()+move_data.y1.toString()+move_data.x2.toString()+move_data.y2.toString();
			//отправляем ход сопернику
			//my_log.add({name:my_data.name,opp_name:opp_data.name,move_data,game_id,made_moves,connected,tm:Date.now(),info:'process_my_move'})
			
			//fbs.ref('inbox/'+opp_data.uid).set({sender:my_data.uid,message:'MOVE',tm:Date.now(),data:{...move_data, board_state:0}});
			
			//новая версия
			const t=((Date.now()-online_game.start_time||2323)*0.001).toFixed(1);
			fbs.ref('inbox/'+opp_data.uid).set({s:my_data.uid.substring(0,8),m:'M',t,d:move_data_short});

			//также фиксируем данные стола
			const moves_made=my_role === 'slave'?made_moves+1:0;
			fbs.ref('tables/'+game_id+'/board').set({uid:my_data.uid,f_str:board_func.brd_to_str(g_board,moves_made),tm:Date.now()});
		
		}
		
		if (my_role === 'slave') {			
			made_moves++;
			objects.cur_move_text.text=['cделано ходов: ','made moves: '][LANG]+made_moves;			
			const result = board_func.get_board_state(g_board, made_moves);
			if (result !== '') {
				this.stop(result);
				return;
			}	
		}
				
		//уведомление что нужно вывести шашки из дома
		if (made_moves>24 && made_moves<31 ) {
			if (board_func.any1home(g_board))
				message.add(['После 30 ходов не должно остаться шашек в доме','After 30 moves, there should be no checkers left in the house'][LANG]);
		}

		//уведомление что игра скоро закончиться
		if (made_moves>75 && made_moves<81 ) {
			message.add(['После 80 хода выиграет тот кто перевел больше шашек в новый дом','After 80 moves, the one who transferred more checkers to the new house will win'][LANG]);
		}

		//перезапускаем таймер хода и кто ходит
		my_turn = 0;
				
		//обновляем таймер
		this.opponent.reset_timer();		

		//обозначаем что я сделал ход и следовательно подтвердил согласие на игру
		this.opponent.me_conf_play=1;

	},	

	async receive_move(move_data) {
			
		//my_log.add({name:my_data.name,move_data,opp_name:opp_data.name,made_moves,my_turn,state:game.state,game_id,connected,tm:Date.now(),info:'rec_move'})			
			
		//это чтобы не принимать ходы если игры нет (то есть выключен таймер)
		if (game.state !== 'on')
			return;		
		
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
		const moves = board_func.get_moves_path(move_data,g_board);

		//плавно перемещаем шашку
		await board_func.start_gentle_move(move_data, moves,g_board, objects.board, objects.checkers);

		
		if (my_role === 'master') {
			made_moves++;
			objects.cur_move_text.text="сделано ходов: "+made_moves;
				
			const result = board_func.get_board_state(g_board, made_moves);
			
			//бота нельзя блокировать
			if (result === 'opp_left_after_30' && this.opponent.name === 'bot')	result = '';
			
			if (result !== '') {
				this.stop(result);
			}			
		}
		
		//my_log.add({name:my_data.name,move_data,opp_name:opp_data.name,made_moves,my_turn,state:game.state,game_id,connected,tm:Date.now(),info:'rec_move_ok'})		
	},
	
	async receive_move2(data) {
				
		const move_data={x1:+data[0],y1:+data[1],x2:+data[2],y2:+data[3]}
		//my_log.add({name:my_data.name,move_data,opp_name:opp_data.name,made_moves,my_turn,state:game.state,game_id,connected,tm:Date.now(),info:'rec_move'})			
			
		//это чтобы не принимать ходы если игры нет (то есть выключен таймер)
		if (game.state !== 'on') return;		
		
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
		const moves = board_func.get_moves_path(move_data,g_board);

		//плавно перемещаем шашку
		await board_func.start_gentle_move(move_data, moves,g_board, objects.board, objects.checkers);

		
		if (my_role === 'master') {
			made_moves++;
			objects.cur_move_text.text="сделано ходов: "+made_moves;
				
			const result = board_func.get_board_state(g_board, made_moves);
			
			//бота нельзя блокировать
			if (result === 'opp_left_after_30' && this.opponent.name === 'bot')	result = '';
			
			if (result !== '') {
				this.stop(result);
			}			
		}
		
		//my_log.add({name:my_data.name,move_data,opp_name:opp_data.name,made_moves,my_turn,state:game.state,game_id,connected,tm:Date.now(),info:'rec_move_ok'})		
	},
	
	async stop(result) {
				
		this.state = 'pending';
				
		await this.opponent.stop(result);
				
		objects.cur_move_text.visible=false;
		objects.board_cont.visible=false;
		objects.opp_card_cont.visible=false;
		objects.my_card_cont.visible=false;
		objects.selected_frame.visible=false;
		//objects.checkers.forEach((c)=> {c.visible=false});
		
		//рекламная пауза
		ad.show();
		await new Promise((resolve, reject) => setTimeout(resolve, 2000));
		
		this.state = 'off';
		//показыаем основное меню
		lobby.activate();

		//стираем данные оппонента
		opp_data.uid="";
		
		//соперника больше нет
		this.opponent = "";

		//устанавливаем статус в базе данных а если мы не видны то установливаем только скрытое состояние
		set_state ({state : 'o'});
	}

}

game_watching={
	
	game_id:0,
	on:false,
	master_uid:'',
	slave_uid:'',
	game_over:0,
	prv_board:0,
	
	async activate(card_data){
		
		this.on=true;
		
		
		this.game_id=card_data.game_id;		
		
		objects.gw_back_button.visible=true;
		objects.my_card_cont.visible = true;	
		objects.opp_card_cont.visible = true;	
		objects.cur_move_text.visible=true;
		anim2.add(objects.board_cont,{alpha:[0,1]}, true, 0.3,'linear');
		objects.board.interactive=false;
		objects.gw_master_chip.visible=true;
		objects.gw_slave_chip.visible=true;
					
		let main_data=await fbs.ref('tables/'+this.game_id).once('value');
		main_data=main_data.val();
		
		//определяем индексы карточек
		const master_ind=+(card_data.uid2===main_data.master)+1
		const slave_ind=3-master_ind;
				
		//аватарки		
		objects.my_avatar.texture=players_cache.players[card_data['uid'+master_ind]].texture;
		objects.opp_avatar.texture=players_cache.players[card_data['uid'+slave_ind]].texture;
				
		//имена
		objects.my_card_name.set2(card_data['name'+master_ind],150);
		objects.opp_card_name.set2(card_data['name'+slave_ind],150);
				
		//рейтинги
		objects.my_card_rating.text=card_data['rating_text'+master_ind].text;
		objects.opp_card_rating.text=card_data['rating_text'+slave_ind].text;		
		
		objects.gw_master_chip.texture=board_func.chips_tex[1]=pref.chips[1].texture;
		objects.gw_slave_chip.texture=board_func.chips_tex[2]=pref.chips[2].texture;	
		
		//устанаваем текстуру доски
		objects.board.texture=pref.board_texture;
		objects.opp_avatar_frame.texture=assets.avatar_frame;
				
		this.master_uid=main_data.master;
		this.slave_uid=main_data.slave;
		
		g_board=null;
		fbs.ref('tables/'+this.game_id+'/board').on('value',(snapshot) => {
			game_watching.new_move(snapshot.val());
		})
		
	},
		
	async new_move(board_data){


		console.log('Data size GW:', JSON.stringify(board_data).length);
		
		if(!this.on) return;
		
		if(!board_data || board_data?.f_str?.length>35){
			//g_board = [[2,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1]];
			//board_func.update_board(g_board);
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
				winner_name=players_cache.players[board_data.uid].name;
			
			if (res===LOSE){				
				const switcher={}
				switcher[this.slave_uid]=this.master_uid;
				switcher[this.master_uid]=this.slave_uid;
				const winner_uid=switcher[board_data.uid];
				winner_name=players_cache.players[winner_uid].name;
			}			

			
			const name=players_cache.players[board_data.uid].name;		
			if (res===WIN||res===LOSE)
				await big_message.show([`Эта игра завершена\nПобедитель: ${winner_name}.`,'This game is over'][LANG],')))');
			else
				await big_message.show(['Эта игра завершена.','This game is over'][LANG],')))');

			
			this.close();
			lobby.activate();
			return;
		} 
			
		//если предыдущее движение не завершено то завершаем его и ждем
		while (moving_chip&&!moving_chip.ready) {
			//anim2.kill_anim(moving_chip);
			await new Promise(resolve => setTimeout(resolve, 100)); // wait for 1 second
		}
						
		const old_board=JSON.parse(JSON.stringify(g_board));
		
		
		const b_str = board_data.f_str.slice(0, 24);
		const move = +board_data.f_str.slice(24);
		const uid=board_data.uid;
		const new_board=board_func.str_to_brd(b_str);
		
		
		if (!document.hidden){
			if (uid===this.master_uid){
				anim2.add(objects.opp_card_cont,{alpha:[0.25,1]}, true, 0.3,'linear',false);
				anim2.add(objects.my_card_cont,{alpha:[1,0.25]}, true, 0.3,'linear',false);
			}else{
				anim2.add(objects.opp_card_cont,{alpha:[1,0.25]}, true, 0.3,'linear',false);
				anim2.add(objects.my_card_cont,{alpha:[0.25,1]}, true, 0.3,'linear',false);
			}			
		}

		
		if (uid===this.slave_uid)
			board_func.rotate_board(new_board)		
		
		//если старой доски еще нет
		if (!g_board){			
			g_board=new_board;
			board_func.update_board(g_board);
			return;
		}		
						
		//опредеяем кто ушел	
		let fig_to_move,tx,ty;
		let move_data={x1:0,y1:0,x2:0,y2:0};
		for (var x = 0; x < 8; x++) {
			for (var y = 0; y < 8; y++) {				
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
		const moves=board_func.get_moves_path(move_data,g_board);		
		await board_func.start_gentle_move(move_data,moves,g_board);
		board_func.update_board(new_board);
		g_board=new_board;
		if (move) objects.cur_move_text.text=['сделано ходов: ','made moves: '][LANG]+move;
		
	},
	
	back_btn_down(){
		
		if (anim2.any_on()) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		this.close();
		lobby.activate();
		
	},
	
	close(){
		
		//восстанавливаем мое имя так как оно могло меняться
		objects.my_card_name.set2(my_data.name,150);
		objects.my_card_rating.text = my_data.rating;
		
		
		anim2.kill_anim(objects.my_card_cont);
		anim2.kill_anim(objects.opp_card_cont);
				
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
				
		anim2.add(objects.chat_keyboard_cont,{y:[450, objects.chat_keyboard_cont.sy]}, true, 0.2,'linear');	


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
		
		var key2 = this.layout.find(k => {return k[4] === key})			
				
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
		
		anim2.add(objects.chat_keyboard_hl,{alpha:[1, 0]}, false, 0.5,'linear');
		
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
		anim2.add(objects.chat_keyboard_cont,{y:[objects.chat_keyboard_cont.y,450]}, false, 0.2,'linear');		
		
	},
	
}

ad={
		
		
	show() {
		
		if (game_platform==="YANDEX") {			
			//показываем рекламу
			window.ysdk.adv.showFullscreenAdv({
			  callbacks: {
				onClose: function() {}, 
				onError: function() {}
						}
			})
		}
		
		if (game_platform==="VK") {
					 
			vkBridge.send("VKWebAppShowNativeAds", {ad_format:"interstitial"})
			.then(data => console.log(data.result))
			.catch(error => console.log(error));	
		}		

		if (game_platform==="MY_GAMES") {
					 
			my_games_api.showAds({interstitial:true});
		}			
		
		if (game_platform==='GOOGLE_PLAY') {
			if (typeof Android !== 'undefined') {
				Android.showAdFromJs();
			}			
		}
		
		
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
		
		sound.play("confirm_dialog");
				
		objects.confirm_msg.text=msg;
		
		anim2.add(objects.confirm_cont,{y:[450,objects.confirm_cont.sy]}, true, 0.6,'easeOutBack');		
				
		return new Promise(function(resolve, reject){					
			confirm_dialog.p_resolve = resolve;	  		  
		});
	},
	
	button_down(res) {
		
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};	
		
		sound.play('click')

		this.close();
		this.p_resolve(res);	
		
	},
	
	close () {
		
		anim2.add(objects.confirm_cont,{y:[objects.confirm_cont.sy,450]}, false, 0.4,'easeInBack');		
		
	}

}

keep_alive = function() {
	
	if (document.hidden) return;

	fbs.ref('players/'+my_data.uid+'/tm').set(firebase.database.ServerValue.TIMESTAMP);
	fbs.ref('inbox/'+my_data.uid).onDisconnect().remove();
	fbs.ref(room_name+'/'+my_data.uid).onDisconnect().remove();

	set_state({});
}

minimax_solver = {


bad_1:[[-4,-4,0,8,25,41,61,85],[-2,-2,2,10,27,43,63,87],[4,4,8,16,33,49,69,93],[19,19,23,31,43,59,79,103],[33,33,37,45,57,73,93,117],[51,51,55,63,75,91,111,135],[73,73,77,85,97,113,133,157],[99,99,103,111,123,139,159,183]],

patterns:[[[0,1,1],[0,2,1],[1,0,1],[2,0,1]],[[0,1,2],[0,2,1],[0,3,1],[1,0,2],[2,0,1],[3,0,1]],[[0,1,1],[0,2,2],[1,0,1],[1,2,1],[2,0,2],[2,1,1]],[[0,1,1],[0,2,2],[0,3,1],[1,0,2],[2,0,1],[3,0,1]],[[0,1,2],[0,2,1],[0,3,1],[1,0,1],[2,0,2],[3,0,1]],[[0,1,1],[0,2,2],[1,0,2],[1,2,1],[2,0,1],[3,0,1]],[[0,1,2],[0,2,1],[0,3,1],[1,0,1],[2,0,2],[2,1,1]],[[0,1,1],[0,2,1],[1,0,1],[2,0,2],[2,1,1]],[[0,1,1],[0,2,2],[1,0,1],[1,2,1],[2,0,1]],[[0,1,2],[0,2,2],[1,0,2],[1,1,1],[1,2,1],[2,0,1]],[[0,1,2],[0,2,1],[1,0,2],[1,1,1],[2,0,2],[2,1,1]],[[0,1,2],[0,2,1],[0,3,1],[1,0,1],[2,0,1]],[[0,1,1],[0,2,1],[1,0,2],[2,0,1],[3,0,1]],[[0,1,2],[0,2,1],[1,0,1],[1,1,1],[2,0,1]],[[0,1,1],[0,2,1],[1,0,2],[1,1,1],[2,0,1]],[[0,1,1],[0,2,2],[1,0,1],[1,2,1],[2,0,1]],[[0,1,1],[0,2,1],[1,0,1],[2,0,2],[2,1,1]],[[0,1,1],[0,2,2],[0,3,1],[1,0,1],[2,0,1]],[[0,1,1],[0,2,1],[1,0,1],[2,0,2],[3,0,1]],[[0,1,2],[0,2,1],[1,0,2],[1,1,1],[2,0,1],[3,0,1]],[[0,1,2],[0,2,1],[0,3,1],[1,0,2],[1,1,1],[2,0,1]]],

fin_moves:[[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,5,5,6,5,7,6,3,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,2,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,3,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,3,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,2,5,3,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,3,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,3,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,3,5,3,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,3,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,3,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,7,5,3,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[5,3,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[5,3,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,5,7,6,7,7],[5,2,5,3,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,5,7,6,7,7],[5,3,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,5,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,3,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,4,4,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,6,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,7,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,3,4,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,6,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,4,4,7,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,5,7,6,7,7],[3,4,4,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,5,7,6,7,7],[4,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[5,4,5,6,5,7,6,3,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,2,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,3,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,2,5,3,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,3,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,3,5,4,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,3,5,4,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,3,5,4,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,3,5,3,5,4,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,3,5,4,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,7,5,3,5,4,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[5,3,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[5,3,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[5,3,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,6,7,7],[4,6,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,5,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,3,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,3,5,4,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,7,5,4,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,4,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,4,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,5,4,7,5,4,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,5,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,5,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,6,7,7],[3,5,4,5,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,6,7,7],[4,7,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,6,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,3,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,6,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,3,5,4,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,4,7,5,4,5,5,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,6,5,4,5,5,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,5,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,4,7,5,4,5,5,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,5,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,6,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,7],[3,6,4,6,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,7,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,3,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,7,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,3,5,4,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,7,5,4,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,4,7,5,4,5,5,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,7,5,4,5,5,5,6,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,7,5,4,5,5,5,6,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,4,7,5,4,5,5,5,6,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6],[3,7,4,7,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6],[5,5,5,6,5,7,6,3,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,3,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,2,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,3,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,2,6,3,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,3,6,5,6,7,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,3,6,5,6,6,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,5,6,6,6,7,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[5,3,5,4,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,3,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,4,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,3,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,4,4,4,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,3,5,4,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,4,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,6,5,4,5,5,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,7,5,4,5,5,5,6,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,4,5,5,5,6,5,7,6,6,6,7,7,4,7,5,7,6,7,7],[4,3,4,4,5,4,5,5,5,6,5,7,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,4,4,6,5,4,5,5,5,6,5,7,6,5,6,7,7,4,7,5,7,6,7,7],[4,4,4,7,5,4,5,5,5,6,5,7,6,5,6,6,7,4,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[5,3,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,6,5,7,6,3,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,7,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,6,3,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,3,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,2,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[5,3,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,2,6,3,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,3,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,3,6,4,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,3,6,4,6,6,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,3,6,4,6,6,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,3,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,3,7,4,7,6,7,7],[5,3,5,4,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,4,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,5,6,6,6,7,7,4,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[3,5,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,3,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,3,5,4,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[3,5,4,5,5,4,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,5,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,4,7,5,4,5,5,5,6,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,3,6,6,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,4,5,5,5,6,5,7,6,6,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,5,5,6,5,7,6,4,6,7,7,4,7,5,7,6,7,7],[4,4,4,5,5,4,5,5,5,6,5,7,6,4,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,3,6,4,6,6,7,4,7,5,7,6,7,7],[4,5,4,7,5,4,5,5,5,6,5,7,6,4,6,6,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,3,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,3,7,4,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[3,6,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,5,3,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,4,4,6,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,5,3,5,4,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,6,4,6,5,4,5,5,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,4,7,5,4,5,5,5,6,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,3,6,5,6,7,7,4,7,5,7,6,7,7],[4,4,4,6,5,4,5,5,5,6,5,7,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,3,6,4,6,7,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,5,5,6,5,7,6,4,6,7,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,6,4,7,5,4,5,5,5,6,5,7,6,4,6,5,7,4,7,5,7,6,7,7],[4,5,4,6,5,4,5,5,5,6,5,7,6,4,6,5,7,4,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,3,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,3,7,4,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[3,7,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,7,5,3,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,4,4,7,5,5,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,7,5,3,5,4,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,5,4,7,5,4,5,6,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,6,4,7,5,4,5,5,5,7,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[3,7,4,7,5,4,5,5,5,6,6,4,6,5,6,6,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,3,6,5,6,6,7,4,7,5,7,6,7,7],[4,4,4,7,5,4,5,5,5,6,5,7,6,5,6,6,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,3,6,4,6,6,7,4,7,5,7,6,7,7],[4,5,4,7,5,4,5,5,5,6,5,7,6,4,6,6,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,4,7,5,7,6,7,7],[4,6,4,7,5,4,5,5,5,6,5,7,6,4,6,5,7,4,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,3,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,3,7,4,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6],[5,3,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[5,3,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,5,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,6,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,3,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,3,7,5,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,3,7,5,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,3,7,5,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,3,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,2,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,5,6,6,6,7,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,5,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,2,7,3,7,5,7,7],[5,3,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[5,3,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,5,5,4,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,6,5,4,5,5,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,7,5,4,5,5,5,6,6,4,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[4,4,5,4,5,5,5,6,5,7,6,5,6,6,6,7,7,3,7,4,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,3,7,4,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,6,6,7,7,3,7,4,7,6,7,7],[4,5,5,4,5,5,5,6,5,7,6,4,6,6,6,7,7,3,7,4,7,6,7,7],[4,6,5,4,5,5,5,6,5,7,6,4,6,5,6,7,7,3,7,4,7,6,7,7],[4,7,5,4,5,5,5,6,5,7,6,4,6,5,6,6,7,3,7,4,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,2,7,4,7,6,7,7],[5,4,5,5,5,6,5,7,6,3,6,4,6,5,6,6,6,7,7,4,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,5,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,2,7,3,7,6,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,5,7,7],[5,4,5,5,5,6,5,7,6,4,6,5,6,6,6,7,7,3,7,4,7,5,7,6]],


	clone_board (board) {

		r_board=[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];
		for (let y=0;y<8;y++)
			for (let x=0;x<8;x++)
				r_board[y][x]=board[y][x];
		return r_board;
	},

	get_childs(board_data, checkers, forward){

		function check_in_hist(x,y, hist) {
			for (let i=0;i<hist.length;i++)
				if (x===hist[i][0] && y===hist[i][1])
					return true;
			return false;
		}

		function left(ix,iy,cur_board,moves_hist,boards_array) {

			var new_x=ix-1;
			var new_y=iy;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;

			if (cur_board[new_y][new_x]===0) {
				cur_board[iy][ix]=0;
				cur_board[new_y][new_x]=checkers;
				boards_array.push([cur_board,ix,iy,new_x,new_y]);
				return;
			}
			else {
				left_combo(ix,iy,cur_board,moves_hist,boards_array);
			}
		}

		function right(ix,iy,cur_board,moves_hist,boards_array) {
			var new_x=ix+1;
			var new_y=iy;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;

			if (cur_board[new_y][new_x]===0) {
				cur_board[iy][ix]=0;
				cur_board[new_y][new_x]=checkers;
				boards_array.push([cur_board,ix,iy,new_x,new_y]);
				return
			} else {
				right_combo(ix,iy,cur_board,moves_hist,boards_array);
			}
		}

		function up(ix,iy,cur_board,moves_hist,boards_array){
			var new_x=ix;
			var new_y=iy-1;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;

			if (cur_board[new_y][new_x]===0) {
				cur_board[iy][ix]=0;
				cur_board[new_y][new_x]=checkers;
				boards_array.push([cur_board,ix,iy,new_x,new_y]);
				return
			} else {
				up_combo(ix,iy,cur_board,moves_hist,boards_array);
			}
		}

		function down(ix,iy,cur_board,moves_hist,boards_array){
			var new_x=ix;
			var new_y=iy+1;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;

			if (cur_board[new_y][new_x]===0) {
				cur_board[iy][ix]=0;
				cur_board[new_y][new_x]=checkers;
				boards_array.push([cur_board,ix,iy,new_x,new_y]);
				return
			} else {
				down_combo(ix,iy,cur_board,moves_hist,boards_array);
			}
		}

		function left_combo(ix,iy,cur_board,moves_hist,boards_array) {

			var new_x=ix-2;
			var new_y=iy;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;
			if (cur_board[iy][ix-1]===0) return;

			if (cur_board[new_y][new_x]===0)
			{

				if (check_in_hist(new_x,new_y,moves_hist)===true) return;

				moves_hist.push([ix,iy]);
				cur_board[new_y][new_x]=cur_board[iy][ix];
				cur_board[iy][ix]=0;

				let d_move=(new_x-moves_hist[0][0])+(new_y-moves_hist[0][1]);
				if (cur_board[new_y][new_x]===1)
					d_move=-d_move;

				if (d_move>min_move_amount)
					boards_array.push([minimax_solver.clone_board(cur_board),moves_hist[0][0],moves_hist[0][1],new_x,new_y]);

				//продолжаем попытки комбо
				left_combo(new_x,new_y,cur_board,moves_hist,boards_array);
				up_combo(new_x,new_y,cur_board,moves_hist,boards_array);
				down_combo(new_x,new_y,cur_board,moves_hist,boards_array);
			}
		}

		function right_combo(ix,iy,cur_board,moves_hist,boards_array) {

			var new_x=ix+2;
			var new_y=iy;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;
			if (cur_board[iy][ix+1]===0) return;

			if (cur_board[new_y][new_x]===0)
			{

				if (check_in_hist(new_x,new_y,moves_hist)===true) return;

				moves_hist.push([ix,iy]);
				cur_board[new_y][new_x]=cur_board[iy][ix];
				cur_board[iy][ix]=0;

				let d_move=(new_x-moves_hist[0][0])+(new_y-moves_hist[0][1]);
				if (cur_board[new_y][new_x]===1)
					d_move=-d_move;

				if (d_move>min_move_amount)
					boards_array.push([minimax_solver.clone_board(cur_board),moves_hist[0][0],moves_hist[0][1],new_x,new_y]);

				//продолжаем попытки комбо
				right_combo(new_x,new_y,cur_board,moves_hist,boards_array);
				up_combo(new_x,new_y,cur_board,moves_hist,boards_array);
				down_combo(new_x,new_y,cur_board,moves_hist,boards_array);
			}
		}

		function up_combo(ix,iy,cur_board,moves_hist,boards_array) {

			var new_x=ix;
			var new_y=iy-2;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;
			if (cur_board[iy-1][ix]===0) return;

			if (cur_board[new_y][new_x]===0)
			{

				if (check_in_hist(new_x,new_y,moves_hist)===true) return;

				moves_hist.push([ix,iy]);
				cur_board[new_y][new_x]=cur_board[iy][ix];
				cur_board[iy][ix]=0;

				let d_move=(new_x-moves_hist[0][0])+(new_y-moves_hist[0][1]);
				if (cur_board[new_y][new_x]===1)
					d_move=-d_move;

				if (d_move>min_move_amount)
					boards_array.push([minimax_solver.clone_board(cur_board),moves_hist[0][0],moves_hist[0][1],new_x,new_y]);

				//продолжаем попытки комбо
				right_combo(new_x,new_y,cur_board,moves_hist,boards_array);
				up_combo(new_x,new_y,cur_board,moves_hist,boards_array);
				left_combo(new_x,new_y,cur_board,moves_hist,boards_array);
			}
		}

		function down_combo(ix,iy,cur_board,moves_hist,boards_array) {

			var new_x=ix;
			var new_y=iy+2;

			if (new_x>7 || new_x<0 || new_y>7 || new_y<0) return;
			if (cur_board[iy+1][ix]===0) return;

			if (cur_board[new_y][new_x]===0)
			{
				if (check_in_hist(new_x,new_y,moves_hist)===true) return;

				moves_hist.push([ix,iy]);
				cur_board[new_y][new_x]=cur_board[iy][ix];
				cur_board[iy][ix]=0;

				let d_move=(new_x-moves_hist[0][0])+(new_y-moves_hist[0][1]);
				if (cur_board[new_y][new_x]===1)
					d_move=-d_move;

				if (d_move>min_move_amount)
					boards_array.push([minimax_solver.clone_board(cur_board),moves_hist[0][0],moves_hist[0][1],new_x,new_y]);

				//продолжаем попытки комбо
				right_combo(new_x,new_y,cur_board,moves_hist,boards_array);
				down_combo(new_x,new_y,cur_board,moves_hist,boards_array);
				left_combo(new_x,new_y,cur_board,moves_hist,boards_array);
			}
		}

		var boards_array=[];

		if (forward===1) {

			if (checkers===1) {
				for (let y=0;y<8;y++) {
					for (let x=0;x<8;x++) {
						if (board_data[y][x]===checkers) {
							var moves_hist=[[x,y]];
							left	(		x,y,	minimax_solver.clone_board(board_data),	moves_hist, boards_array);
							up		(		x,y,	minimax_solver.clone_board(board_data),	moves_hist, boards_array);
						}
					}
				}
			}

			if (checkers===2) {

				for (let y=0;y<8;y++) {
					for (let x=0;x<8;x++) {
						if (board_data[y][x]===checkers) {
							var moves_hist=[[x,y]];
							right	(		x,y,	minimax_solver.clone_board(board_data),	moves_hist, boards_array);
							down	(		x,y,	minimax_solver.clone_board(board_data),	moves_hist, boards_array);
						}
					}
				}
			}
		} else {

			for (let y=0;y<8;y++) {
				for (let x=0;x<8;x++) {
					if (board_data[y][x]===checkers) {
						var moves_hist=[[x,y]];
						right	(		x,y,	minimax_solver.clone_board(board_data),	moves_hist, boards_array);
						down	(		x,y,	minimax_solver.clone_board(board_data),	moves_hist, boards_array);
						left	(		x,y,	minimax_solver.clone_board(board_data),	moves_hist, boards_array);
						up		(		x,y,	minimax_solver.clone_board(board_data),	moves_hist, boards_array);
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

	board_val(board, made_moves) {

		var val_1=0;
		var val_2=0;


		for (let y=0;y<8;y++) {
			for (let x=0;x<8;x++) {

				if (board[y][x]===1)
					val_1-=this.bad_1[y][x];

				if (board[y][x]===2)
					val_2-=this.bad_1[7-y][7-x];
			}
		}

		//вычисляем блокированных 2 и добавляем как бонус к 1 dxdy положительный
		for (let y=0;y<3;y++) {
			for (let x=0;x<4;x++) {
				if (board[y][x]===2) {
					for (let p=0;p<this.patterns.length;p++) {

						let pattern_ok=1;
						for (let r=0;r<this.patterns[p].length;r++) {
							let dy=this.patterns[p][r][0];
							let dx=this.patterns[p][r][1];
							let ch=this.patterns[p][r][2];

							if (board[y+dy][x+dx]!==ch) {
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
				if (board[y][x]===1) {
					for (let p=0;p<this.patterns.length;p++) {

						let pattern_ok=1;
						for (let r=0;r<this.patterns[p].length;r++) {
							let dy=-this.patterns[p][r][0];
							let dx=-this.patterns[p][r][1];
							let ch=3-this.patterns[p][r][2];

							if (board[y+dy][x+dx]!==ch) {
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

			if (board_func.any1home(board)===1)
				val_2=999999;

			if (board_func.any2home(board)===1)
				val_1=999999;
		}

		return val_1-val_2;
	},

	invert_board(board) {

		inv_brd=minimax_solver.clone_board(board);
		for (let y = 0; y < 8; y++) {
			for (let x = 0; x < 8; x++) {
				inv_brd[y][x] = board[7-y][7-x];
				if (inv_brd[y][x] !== 0)
					inv_brd[y][x] = 3 - inv_brd[y][x];
			}
		}

		return inv_brd;

	},

	check_fin_moves(board) {

		for (let i=0;i<this.fin_moves.length;i++) {

			let found=1;
			for (let c=0;c<12;c++) {

				let y=this.fin_moves[i][c*2];
				let x=this.fin_moves[i][c*2+1];
				if (board[y][x]!=2) {
					found=0;
					break;
				}
			}

			if (found===1)
				return 1;
		}
		return 0;
	},

	how_bad_board_2(board) {

		var bad_val_1=[0,999];

		for (let y=0;y<8;y++) {
			for (let x=0;x<8;x++) {
				if (board[y][x]===2) {

					let cy=7-y;
					let cx=7-x;
					let v=this.bad_1[cy][cx];
					bad_val_1[0]+=v;
				}
			}
		}


		if (board_func.finished2(board))
			return [-999999,0];

		if (this.check_fin_moves(board)===1)
			return [-999999,2];

		return bad_val_1;
	},

	minimax_3(board,made_moves) {

		this.make_weights_board(made_moves);
		let inv_brd=this.invert_board(board);

		var m_data2={};
		var m_data={};

		var max_ind=0;
		var max_ind2=0;
		var max_val2=0;
		var max_0=-9999999;
		var childs0=this.get_childs(inv_brd,1,1);
		for (let c0=0;c0<childs0.length;c0++) {

			var min_1=9999999;
			var childs1=this.get_childs(childs0[c0][0],2,1);
			for (let c1=0;c1<childs1.length;c1++) {


				var max_2=-9999999;
				var childs2=this.get_childs(childs1[c1][0],1,1);
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
		return m_data;

	},

	download(content, fileName, contentType) {
		var a = document.createElement("a");
		var file = new Blob([content], {type: contentType});
		a.href = URL.createObjectURL(file);
		a.download = fileName;
		a.click();
	},

	generate_fin_moves() {

		let tb=[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1]];

		let bcnt=0;
		arr2=[]
		var childs0=this.get_childs(tb,1,0);
		for (let c0=0;c0<childs0.length;c0++) {

			var childs1=this.get_childs(childs0[c0][0],1,0);
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

	},

	minimax_3_single(board, made_moves) {

		this.make_weights_board2(made_moves);
		min_move_amount=-3;

		//this.update_weights_board();
		var m_data={};
		var min_bad=999999;
		var min_moves_to_win=9999;


		var childs0=this.get_childs(board,2,0);
		for (let c0=0;c0<childs0.length;c0++) {
			let ret=this.how_bad_board_2(childs0[c0][0]);
			let moves_to_win=ret[1]+1;
			let val=ret[0];

			if (val===-999999 && min_moves_to_win>moves_to_win) {
				min_moves_to_win=moves_to_win;
				m_data={x1:childs0[c0][1],y1:childs0[c0][2],x2:childs0[c0][3], y2:childs0[c0][4]};
			}

			var childs1=this.get_childs(childs0[c0][0],2,0);
			for (let c1=0;c1<childs1.length;c1++) {
				let ret=this.how_bad_board_2(childs1[c1][0]);
				let moves_to_win=ret[1]+2;
				let val=ret[0];

				if (val===-999999 && min_moves_to_win>moves_to_win) {
					min_moves_to_win=moves_to_win;
					m_data={x1:childs0[c0][1],y1:childs0[c0][2],x2:childs0[c0][3], y2:childs0[c0][4]};
				}

				var childs2=this.get_childs(childs1[c1][0],2,0);
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

		return m_data;
	},

	minimax_4_single(board) {

		//this.update_weights_board(15);
		min_move_amount=-3;

		//this.update_weights_board();
		var m_data={};
		var min_bad=999999;
		var min_depth=999;

		var childs0=this.get_childs(board,2,0);
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


			var childs1=this.get_childs(childs0[c0][0],2,0);
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


				var childs2=this.get_childs(childs1[c1][0],2,0);
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


					var childs3=this.get_childs(childs2[c2][0],2,1);
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


}

function kill_game() {
	
	firebase.app().delete();
	my_ws.kill();
	document.body.innerHTML = 'CLIENT TURN OFF';
}

function process_new_message(msg) {


	//console.log('msg:',msg,JSON.stringify(msg).length);
	
	//проверяем плохие сообщения
	if (msg===null || msg===undefined)
		return;

	//принимаем только положительный ответ от соответствующего соперника и начинаем игру
	if (msg.message==="ACCEPT"  && pending_player===msg.sender && state !== "p") {
		//в данном случае я мастер и хожу вторым
		opp_data.uid=msg.sender;
		game_id=msg.game_id;
		lobby.accepted_invite();
	}

	//принимаем также отрицательный ответ от соответствующего соперника
	if (msg.message?.includes("REJECT")  && pending_player === msg.sender) {
		lobby.rejected_invite(msg.message);
	}

	//айди клиента для удаления дубликатов
	if (msg.message==="CLIEND_ID") 
		if (msg.client_id !== client_id)
			kill_game();

	//сообщение о блокировке чата
	if (msg.message==='CHAT_BLOCK'){
		my_data.blocked=1;		
	}

	//получение сообщение в состояни игры
	if (state==="p") {

		//учитываем только сообщения от соперника
		if (msg.sender===opp_data.uid||msg.s.substring(0,8)===opp_data.uid.substring(0,8)) {

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
			
			//получение сообщение с ходом игорка оптимизированный вариант
			if (msg.m==='M')
				game.receive_move2(msg.d);
			
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
			if (msg.sender === req_dialog._opp_data.uid)
				req_dialog.hide(msg.sender);
		}
	}

}

req_dialog = {

	_opp_data : {} ,
	silent_mode_tm:0,
	
	async show(uid) {
		
		
		//если активен режим тишины
		const tm=Date.now();
		if(tm<this.silent_mode_tm){
			fbs.ref('inbox/'+uid).set({sender:my_data.uid,message:'REJECT_ALL',tm:Date.now()});
			return;
		}
		
		//если нет в кэше то загружаем из фб
		await players_cache.update(uid);
		await players_cache.update_avatar(uid);
		
		const player=players_cache.players[uid];
		
		sound.play('receive_sticker');	
		
		anim2.add(objects.req_cont,{y:[-260, objects.req_cont.sy]}, true, 0.75,'easeOutElastic');
							
		//Отображаем  имя и фамилию в окне приглашения
		req_dialog._opp_data.uid=uid;		
		req_dialog._opp_data.name=player.name;		
		req_dialog._opp_data.rating=player.rating;
				
		objects.req_name.set2(player.name,200);
		objects.req_rating.text=player.rating;
		
		objects.req_avatar.set_texture(player.texture);


	},

	deny_btn_down() {
		
		if (objects.req_cont.ready===false || objects.req_cont.visible===false)
			return;
		
		sound.play('close');
		
		//подсветка
		objects.req_btn_hl.x=objects.req_deny_btn.x;
		objects.req_btn_hl.y=objects.req_deny_btn.y;
		anim2.add(objects.req_btn_hl,{alpha:[0,1]}, false, 0.25,'ease3peaks',false);	

		anim2.add(objects.req_cont,{y:[objects.req_cont.sy, -260]}, false, 0.5,'easeInBack');

		fbs.ref("inbox/"+req_dialog._opp_data.uid).set({sender:my_data.uid,message:'REJECT',tm:Date.now()});
	},
	
	deny_all_btn_down() {
		
		if (objects.req_cont.ready===false || objects.req_cont.visible===false)
			return;
		
		sound.play('close');
		
		//подсветка
		objects.req_btn_hl.x=objects.req_deny_all_btn.x;
		objects.req_btn_hl.y=objects.req_deny_all_btn.y;
		anim2.add(objects.req_btn_hl,{alpha:[0,1]}, false, 0.25,'ease3peaks',false);	
		
		//режим без приглашений на 3 минуты
		this.silent_mode_tm=Date.now()+180000;
		
		message.add(["Приглашения отключены на 3 минуты","No game requests for 3 minutes"][LANG]);
		//удаляем меня из комнаты
		//fbs.ref(room_name+'/'+my_data.uid).remove();
		
		anim2.add(objects.req_cont,{y:[objects.req_cont.sy, -260]}, false, 0.5,'easeInBack');
		fbs.ref('inbox/'+req_dialog._opp_data.uid).set({sender:my_data.uid,message:'REJECT_ALL',tm:Date.now()});
	},

	accept_btn_down() {

		if (anim2.any_on()||objects.req_cont.visible===false || objects.big_message_cont.visible === true || game.state === 'pending') {
			sound.play('locked');
			return;			
		}
		
		//подсветка
		objects.req_btn_hl.x=objects.req_accept_btn.x;
		objects.req_btn_hl.y=objects.req_accept_btn.y;
		anim2.add(objects.req_btn_hl,{alpha:[0,1]}, false, 0.25,'ease3peaks',false);	
		
		//устанавливаем окончательные данные оппонента
		opp_data = req_dialog._opp_data;	
	
		anim2.add(objects.req_cont,{y:[objects.req_cont.sy, -260]}, false, 0.5,'easeInBack');

		//отправляем информацию о согласии играть с идентификатором игры
		game_id=~~(Math.random()*99999);
		fbs.ref('inbox/'+opp_data.uid).set({sender:my_data.uid,message:'ACCEPT',tm:Date.now(),game_id:game_id});

		lobby.close();
		game.activate(online_game, 'slave');
		//game2.activate('slave');

	},

	hide() {

		//если диалог не открыт то ничего не делаем
		if (objects.req_cont.ready === false || objects.req_cont.visible === false)
			return;

		anim2.add(objects.req_cont,{y:[objects.req_cont.sy, -260]}, false, 0.5,'easeInBack');

	}

}

my_ws={
	
	socket:0,
	
	child_added:{},
	child_changed:{},
	child_removed:{},
		
	get_resolvers:{},
	get_req_id:0,
	reconnecting:0,
	reconnect_time:0,
	connect_resolver:0,
	sleep:0,
	keep_alive_timer:0,
		
	init(){		
		if(this.socket.readyState===1) return;
		return new Promise(resolve=>{
			this.connect_resolver=resolve;
			this.reconnect();
		})
	},
	
	send_to_sleep(){		
		if (this.socket.readyState===1){
			this.sleep=1;	
			this.socket.close(1000, "sleep");
		}
	},
	
	kill(){
		
		this.sleep=1;
		this.socket.close(1000, "kill");
		
	},
	
	reconnect(){
		
		this.sleep=0;
		this.reconnecting=0;

		if (this.socket) {
			this.socket.onopen = null;
			this.socket.onmessage = null;
			this.socket.onclose = null;
			this.socket.onerror = null;	
			this.socket.close();
		}

		this.socket = new WebSocket('wss://timewebmtgames.ru:8443/corners/'+my_data.uid);
				
		this.socket.onopen = () => {
			console.log('Connected to server!');
			this.connect_resolver();
			this.reconnect_time=0;
			
			//обновляем подписки
			for (const path in this.child_added)				
				this.socket.send(JSON.stringify({cmd:'child_added',path}))					
			
			clearInterval(this.keep_alive_timer)
			this.keep_alive_timer=setInterval(()=>{
				this.socket.send(1);
			},45000);
		};			
		
		this.socket.onmessage = event => {
			
			const msg=JSON.parse(event.data);
			//console.log("Получено от сервера:", msg);
			
			if (msg.event==='child_added')	
				this.child_added[msg.node]?.(msg);
			
			if (msg.event==='get')
				if (this.get_resolvers[msg.req_id])
					this.get_resolvers[msg.req_id](msg.data);

		};
		
		this.socket.onclose = event => {			
			clearInterval(this.keep_alive_timer)
			console.log('Socket closed:', event);
			if(this.sleep) return;
			if(!this.reconnecting){
				this.reconnecting=1;
				this.reconnect_time=Math.min(60000,this.reconnect_time+5000);
				console.log(`reconnecting in ${this.reconnect_time*0.001} seconds:`, event);
				setTimeout(()=>{this.reconnect()},this.reconnect_time);				
			}
		};

		this.socket.onerror = error => {
			//console.error("WebSocket error:", error);
		};
		
	},
	
	get(path,limit_last){		
		return new Promise(resolve=>{
			
			const req_id=irnd(1,999999);
						
			const timeoutId = setTimeout(() => {
				delete this.get_resolvers[req_id];
				resolve(0);
			}, 5000);			
			
			this.get_resolvers[req_id]=(data)=>{				
				clearTimeout(timeoutId);
				resolve(data);					
			}
			
			/*
			this.get_resolvers[req_id] = {
				resolve: (data) => {
					clearTimeout(timeoutId);
					resolve(data);
				}
			};*/
			
			this.socket.send(JSON.stringify({cmd:'get',path,req_id,limit_last}))				
		
		})	
	},
	
	ss_child_added(path,callback){
		
		this.socket.send(JSON.stringify({cmd:'child_added',path}))	
		this.child_added[path]=callback;
		
	},

	ss_child_changed(path,callback){
		
		this.socket.send(JSON.stringify({cmd:'child_changed',node:path}))	
		this.child_changed[path]=callback;
		
	},
	
	ss_child_removed(path,callback){
		
		this.socket.send(JSON.stringify({cmd:'child_removed',node:path}))	
		this.child_removed[path]=callback;
		
	}	
		
}

chat={
	
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
	payments:0,
	processing:0,
	remote_socket:0,
	ss:[],
		
	activate() {	

		anim2.add(objects.chat_cont,{alpha:[0, 1]}, true, 0.1,'linear');
		//objects.bcg.texture=assets.lobby_bcg;
		objects.chat_enter_button.visible=true;//my_data.games>=this.games_to_chat;
		
		if(my_data.blocked)		
			objects.chat_enter_button.texture=assets.chat_blocked_img;
		else
			objects.chat_enter_button.texture=assets.chat_enter_img;

		objects.chat_rules.text='Правила чата!\n1. Будьте вежливы: Общайтесь с другими игроками с уважением. Избегайте угроз, грубых выражений, оскорблений, конфликтов.\n2. Отправлять сообщения в чат могут игроки сыгравшие более 200 онлайн партий.\n3. За нарушение правил игрок может попасть в черный список.'
		if(my_data.blocked) objects.chat_rules.text='Вы не можете писать в чат, так как вы находитесь в черном списке';
		
		
	},
		
	new_message(data){
		
		console.log('new_data',data);
		
	},
	
	async init(){	
			
		this.last_record_end = 0;
		objects.chat_msg_cont.y = objects.chat_msg_cont.sy;		
		objects.bcg.interactive=true;
		objects.bcg.pointermove=this.pointer_move.bind(this);
		objects.bcg.pointerdown=this.pointer_down.bind(this);
		objects.bcg.pointerup=this.pointer_up.bind(this);
		objects.bcg.pointerupoutside=this.pointer_up.bind(this);
		
		for(let rec of objects.chat_records) {
			rec.visible = false;			
			rec.msg_id = -1;	
			rec.tm=0;
		}		
		
		this.init_yandex_payments();

		await my_ws.init();	
		
		//загружаем чат		
		const chat_data=await my_ws.get('corners/chat',25);
		
		await this.chat_load(chat_data);
		
		//подписываемся на новые сообщения
		my_ws.ss_child_added('corners/chat',chat.chat_updated.bind(chat))
		
		console.log('Чат загружен!')
	},		

	init_yandex_payments(){
				
		if (game_platform!=='YANDEX') return;			
				
		if(this.payments) return;
		
		ysdk.getPayments({ signed: true }).then(_payments => {
			chat.payments = _payments;
		}).catch(err => {})			
		
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
		
	block_player(uid){
		
		fbs.ref('blocked/'+uid).set(Date.now());
		fbs.ref('inbox/'+uid).set({message:'CHAT_BLOCK',tm:Date.now()});
		
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
		if(data===undefined||!data.msg||!data.name||!data.uid) return;
				
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
			await anim2.add(objects.chat_msg_cont,{y:[objects.chat_msg_cont.y,objects.chat_msg_cont.y-y_shift]},true, 0.05,'linear');		
		else
			objects.chat_msg_cont.y-=y_shift
		
		this.processing=0;
		
	},
						
	avatar_down(player_data){
		
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
			fbs.ref('inbox/'+player_data.uid).set({message:'CLIEND_ID',tm:Date.now(),client_id:999999});
			console.log('Игрок убит: ',player_data.uid);
			this.kill_next_click=0;
		}
		
		if(this.delete_message_mode){			
			fbs.ref(`${chat_path}/${player_data.index}`).remove();
			console.log(`сообщение ${player_data.index} удалено`)
		}
		
		
		if(this.moderation_mode||this.block_next_click||this.kill_next_click||this.delete_message_mode) return;
		
		if (objects.chat_keyboard_cont.visible)		
			keyboard.response_message(player_data.uid,player_data.name.text);
		else
			lobby.show_invite_dialog_from_chat(player_data.uid,player_data.name.text);
		
		
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
	
	back_button_down(){
		
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
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
		
		objects.chat_msg_cont.y-=delta*50;	
		const chat_bottom = this.last_record_end;
		const chat_top = this.last_record_end - objects.chat_records.filter(obj => obj.visible === true).length*70;
		
		if (objects.chat_msg_cont.y+chat_bottom<430)
			objects.chat_msg_cont.y = 430-chat_bottom;
		
		if (objects.chat_msg_cont.y+chat_top>0)
			objects.chat_msg_cont.y=-chat_top;
		
	},
	
	make_hash() {
	  let hash = '';
	  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	  for (let i = 0; i < 6; i++) {
		hash += characters.charAt(Math.floor(Math.random() * characters.length));
	  }
	  return hash;
	},
		
	async write_button_down(){
		
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};
				
		//оплата разблокировки чата
		if (my_data.blocked){	
		
			let block_num=await fbs_once('players/'+my_data.uid+'/block_num');
			block_num=block_num||1;
			block_num=Math.min(6,block_num);
		
			if(game_platform==='YANDEX'){
				
				this.payments.purchase({ id: 'unblock'+block_num}).then(purchase => {
					this.unblock_chat();
				}).catch(err => {
					message.add('Ошибка при покупке!');
				})				
			}
			
			if (game_platform==='VK') {
				
				vkBridge.send('VKWebAppShowOrderBox', { type: 'item', item: 'unblock'+block_num}).then(data =>{
					this.unblock_chat();
				}).catch((err) => {
					message.add('Ошибка при покупке!');
				});			
			
			};			
				
			return;
		}
				
		sound.play('click');
		
		//убираем метки старых сообщений
		const cur_dt=Date.now();
		this.recent_msg = this.recent_msg.filter(d =>cur_dt-d<60000);
				
		if (this.recent_msg.length>3){
			message.add('Подождите 1 минуту')
			return;
		}		
		
		//добавляем отметку о сообщении
		this.recent_msg.push(Date.now());
		
		//пишем сообщение в чат и отправляем его		
		const msg = await keyboard.read(70);		
		if (msg) {			
			const index=irnd(1,999);
			my_ws.socket.send(JSON.stringify({cmd:'push',path:'corners/chat',val:{uid:my_data.uid,name:my_data.name,msg,tm:'TMS'}}))	
			//fbs.ref(chat_path+'/'+index).set({uid:my_data.uid,name:my_data.name,msg, tm:firebase.database.ServerValue.TIMESTAMP,index});
		}	
		
	},
	
	unblock_chat(){
		objects.chat_rules.text='Правила чата!\n1. Будьте вежливы: Общайтесь с другими игроками с уважением. Избегайте угроз, грубых выражений, оскорблений, конфликтов.\n2. Отправлять сообщения в чат могут игроки сыгравшие более 200 онлайн партий.\n3. За нарушение правил игрок может попасть в черный список.'
		objects.chat_enter_button.texture=assets.chat_enter_img;	
		fbs.ref('blocked/'+my_data.uid).remove();
		my_data.blocked=0;
		message.add('Вы разблокировали чат');
		sound.play('mini_dialog');	
	},
		
	close() {
		
		anim2.add(objects.chat_cont,{alpha:[1, 0]}, false, 0.1,'linear');
		if (objects.chat_keyboard_cont.visible)
			keyboard.close();
	}
		
}

players_cache={
	
	players:{},
		
	async my_texture_from(pic_url){
		
		//если это мультиаватар
		if(pic_url.includes('mavatar')) pic_url=multiavatar(pic_url);
	
		try{
			const texture = await PIXI.Texture.fromURL(pic_url);	
			return texture;
		}catch(er){
			return PIXI.Texture.WHITE;
		}

	},
	
	async update(uid,params={}){
				
		//если игрока нет в кэше то создаем его
		if (!this.players[uid]) this.players[uid]={}
							
		//ссылка на игрока
		const player=this.players[uid];
		
		//заполняем параметры которые дали
		for (let param in params) player[param]=params[param];
		
		if (!player.name) player.name=await fbs_once('players/'+uid+'/name');
		if (!player.rating) player.rating=await fbs_once('players/'+uid+'/rating');
	},
	
	async update_avatar(uid){
		
		const player=this.players[uid];
		if(!player) alert('Не загружены базовые параметры '+uid);
		
		//если текстура уже есть
		if (player.texture) return;
		
		//если нет URL
		if (!player.pic_url) player.pic_url=await fbs_once('players/'+uid+'/pic_url');
		
		if(player.pic_url==='https://vk.com/images/camera_100.png')
			player.pic_url='https://akukamil.github.io/domino/vk_icon.png';
				
		//загружаем и записываем текстуру
		if (player.pic_url) player.texture=await this.my_texture_from(player.pic_url);		
		
	},
	
	async update_avatar_forced(uid, pic_url){
		
		const player=this.players[uid];
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

	cards_pos: [[370,10],[380,70],[390,130],[380,190],[360,250],[330,310],[290,370]],
	last_update:0,

	show() {

		objects.bcg.texture=assets.lb_bcg;
		anim2.add(objects.bcg,{alpha:[0,1]}, true, 0.5,'linear');
		
		anim2.add(objects.lb_1_cont,{x:[-150, objects.lb_1_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_2_cont,{x:[-150, objects.lb_2_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_3_cont,{x:[-150, objects.lb_3_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_cards_cont,{x:[450, 0]}, true, 0.5,'easeOutCubic');
				
		objects.lb_cards_cont.visible=true;
		objects.lb_back_button.visible=true;

		for (let i=0;i<7;i++) {
			objects.lb_cards[i].x=this.cards_pos[i][0];
			objects.lb_cards[i].y=this.cards_pos[i][1];
			objects.lb_cards[i].place.text=(i+4)+".";

		}

		if (Date.now()-this.last_update>120000){
			this.update();
			this.last_update=Date.now();
		}


	},

	close() {

		objects.bcg.texture=assets.bcg;
		objects.lb_1_cont.visible=false;
		objects.lb_2_cont.visible=false;
		objects.lb_3_cont.visible=false;
		objects.lb_cards_cont.visible=false;
		objects.lb_back_button.visible=false;

	},

	back_button_down() {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};


		sound.play('click');
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
		
		for (let i=0;i<7;i++){	
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
			players_cache.update(uid,leader_params);			
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
			await players_cache.update_avatar(leader.uid);			
			target.avatar.texture=players_cache.players[leader.uid].texture;
		}
	
	}


}

pref={
	
	board_texture:null,
	chips:[0,{texture:null},{texture:null}],	
	selected_design:0,
	design_loader:new PIXI.Loader(),
	cur_pic_url:'',
	avatar_changed:0,
	name_changed:0,
	tex_loading:0,
	avatar_switch_center:0,
	avatar_swtich_cur:0,
	
	activate(){					
				
		//устанавливаем текущий фон
		this.select_design(objects.designs[my_data.design_id]);
						
		//определяем доступные скины
		for (let i in DESIGN_DATA){			
			const rating_req=DESIGN_DATA[i].rating;
			const games_req=DESIGN_DATA[i].games;	
			const av=my_data.rating>=rating_req||my_data.games>=games_req;
			objects.designs[i].lock.visible=!av;
		}
		
		anim2.add(objects.pref_info,{alpha:[0,1]}, false, 3,'easeBridge',false);	
		objects.pref_info.text=['Менять аватар и имя можно 1 раз в 30 дней!','You can change name and avatar once per month'][LANG];
				
		objects.pref_sound_slider.x=sound.on?367:322;
		
		//пока ничего не изменено
		this.avatar_changed=0;
		this.name_changed=0;
		
		//заполняем имя и аватар
		objects.pref_name.set2(my_data.name,260);
		objects.pref_avatar.set_texture(players_cache.players[my_data.uid].texture);	
		
		this.avatar_switch_center=this.avatar_swtich_cur=irnd(9999,999999);
		
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
			anim2.add(objects.pref_info,{alpha:[0,1]}, false, 3,'easeBridge',false);	
			sound.play('locked');
			return 0;
		}
		
		return 1;
	},
			
	async load_design(design_id){
		
		const design_name=DESIGN_DATA[design_id].name;
		
		const board_res_name=design_name+'_board';
		const chip1_res_name=design_name+'_chip1';
		const chip2_res_name=design_name+'_chip2';
		const d_res=this.design_loader.resources;
		
		if (!d_res[board_res_name]) this.design_loader.add(board_res_name,git_src+'res/design/'+board_res_name+'.png');		
		if (!d_res[chip1_res_name]) this.design_loader.add(chip1_res_name,git_src+'res/design/'+chip1_res_name+'.png');	
		if (!d_res[chip2_res_name]) this.design_loader.add(chip2_res_name,git_src+'res/design/'+chip2_res_name+'.png');

		console.time('load design');
		await new Promise(resolve=> this.design_loader.load(resolve))
		console.timeEnd('load design');
		this.board_texture=d_res[board_res_name].texture;
		this.chips[1].texture=d_res[chip1_res_name].texture;
		this.chips[2].texture=d_res[chip2_res_name].texture;
	},
	
	message(msg){
		
		objects.pref_info.text=msg;
		anim2.add(objects.pref_info,{alpha:[0,1]}, false, 3,'easeBridge',false);	
	
	},
	
	design_down(bcg){
		
		
		const rating_req=DESIGN_DATA[bcg.id].rating;
		const games_req=DESIGN_DATA[bcg.id].games;
		
		if (!(my_data.rating>=rating_req||my_data.games>=games_req)){
			anim2.add(bcg.lock,{angle:[bcg.lock.angle,bcg.lock.angle+10]}, true, 0.15,'shake');
			const msg=[`НУЖНО: Рейтинг >${rating_req} или Игры >${games_req}`,`NEED: Rating >${rating_req} or Games >${games_req}`][LANG];
			this.message(msg);
			sound.play('locked');
			return;
		}
		
		sound.play('click');
		this.select_design(bcg);	
	},
	
	select_design(design){
		this.selected_design=design;
		objects.pref_design_hl.x=design.x;
		objects.pref_design_hl.y=design.y;	
	},
		
	async change_name_down(){
				
		//провряем можно ли менять ник
		if(!this.check_time(my_data.nick_tm)) return;
										
		const name=await keyboard.read(15);
		if (name.length>1){			
			this.name_changed=name;
			objects.pref_name.set2(name,260);
			objects.pref_info.text=['Нажмите ОК чтобы сохранить','Press OK to confirm'][LANG];
			objects.pref_info.visible=true;	
		}else{			
			objects.pref_info.text=['Какая-то ошибка','Unknown error'][LANG];
			anim2.add(objects.pref_info,{alpha:[0,1]}, false, 3,'easeBridge',false);			
		}
		
	},
			
	async arrow_down(dir){
		
		if (anim2.any_on()||this.tex_loading) {
			sound.play('blocked');
			return;
		}
				
		if(!this.check_time(my_data.avatar_tm)) return;
		this.avatar_changed=1;
				
		//перелистываем аватары
		this.avatar_swtich_cur+=dir;
		if (this.avatar_swtich_cur===this.avatar_switch_center){
			this.cur_pic_url=players_cache.players[my_data.uid].pic_url
		}else{
			this.cur_pic_url='mavatar'+this.avatar_swtich_cur;
		}
		
		
		this.tex_loading=1;		
		const t=await players_cache.my_texture_from(multiavatar(this.cur_pic_url));
		this.tex_loading=0;
		
		objects.pref_avatar.set_texture(t);
		objects.pref_info.text=['Нажмите ОК чтобы сохранить','Press OK to confirm'][LANG];
		objects.pref_info.visible=true;		
	
	},
	
	async reset_avatar_down(){
				
		if (anim2.any_on()||this.tex_loading) {
			sound.play('blocked');
			return;
		}
		
		this.avatar_changed=1;
		this.cur_pic_url=my_data.orig_pic_url;
		this.tex_loading=1;
		const t=await players_cache.my_texture_from(my_data.orig_pic_url);
		objects.pref_avatar.set_texture(t);
		this.tex_loading=0;
		objects.pref_info.text=['Нажмите ОК чтобы сохранить','Press OK to confirm'][LANG];
		objects.pref_info.visible=true;
	},
			
	pin_btn_down(){
		
		if (anim2.any_on()) {
			sound.play('locked');
			return
		};

		sound.play('click');
		
		pin_panel.activate();
		
	},
			
	sound_btn_down(){
		
		if(anim2.any_on()){
			sound.play('locked');
			return;			
		}
		
		sound.switch();
		sound.play('click');
		const tar_x=sound.on?367:322;
		anim2.add(objects.pref_sound_slider,{x:[objects.pref_sound_slider.x,tar_x]}, true, 0.1,'linear');	
		
	},
		
	close(){
		
		//убираем контейнер
		anim2.add(objects.pref_cont,{x:[objects.pref_cont.x,-800]}, false, 0.2,'linear');
		anim2.add(objects.pref_footer_cont,{y:[objects.pref_footer_cont.y,450]}, false, 0.2,'linear');	
		
	},
		
	switch_to_lobby(){
		
		this.close();
		
		//показываем лобби
		anim2.add(objects.cards_cont,{x:[800,0]}, true, 0.2,'linear');		
		anim2.add(objects.lobby_footer_cont,{y:[450,objects.lobby_footer_cont.sy]}, true, 0.2,'linear');
		
	},
		
	close_btn_down(button_data){
		
		if(anim2.any_on()){
			sound.play('locked');
			return;			
		}
		sound.play('click');		
		this.switch_to_lobby();		
	},
		
	ok_btn_down(){
		
		if(anim2.any_on()){
			sound.play('locked');
			return;			
		}
		
		sound.play('click');		
		this.switch_to_lobby();	
		
		if (this.avatar_changed){
									
			fbs.ref(`players/${my_data.uid}/pic_url`).set(this.cur_pic_url);
			//fbs.ref(`pdata/${my_data.uid}/PUB/pic_url`).set(this.cur_pic_url);			

			my_data.avatar_tm=Date.now();
			fbs.ref(`players/${my_data.uid}/avatar_tm`).set(my_data.avatar_tm);
			//fbs.ref(`pdata/${my_data.uid}/PRV/avatar_tm`).set(my_data.avatar_tm);
					
			//обновляем аватар в кэше
			players_cache.update_avatar_forced(my_data.uid,this.cur_pic_url).then(()=>{
				const my_card=objects.mini_cards.find(card=>card.uid===my_data.uid);
				my_card.avatar.set_texture(players_cache.players[my_data.uid].texture);				
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
			fbs.ref('players/'+my_data.uid+'/design_id').set(my_data.design_id);
			this.load_design(my_data.design_id);
		}
		
	}
	
		
}

pin_panel={
	
	buttons_data:[[20,101,69.13,150,'pin_button_1'],[80,101,129.13,150,'pin_button_2'],[140,101,190,151,'pin_button_3'],[20,160,70,210,'pin_button_4'],[80,160,130,210,'pin_button_5'],[140,160,190,210,'pin_button_6'],[20,220,70,271,'pin_button_7'],[80,221,130,271,'pin_button_8'],[140,221,190,271,'pin_button_9'],[20,281,130,331,'pin_button_create'],[140,281,250,331,'pin_button_enter'],[200,21,250,71,'pin_button_erase'],[200,101,250,151,'pin_button_close']],
	t_pin:'',
	check_is_on:0,
	admin_mode:0,
	
	activate(){
		
		anim2.add(objects.pin_panel_cont,{alpha:[0, 1]}, true, 0.1,'linear');	
		objects.pin_panel_msg.text='Введите четырехзначный номер комнаты';
		anim2.add(objects.pin_panel_msg,{alpha:[0, 1]}, true, 0.15,'easeTwiceBlink');		
		
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
		anim2.add(objects.pin_panel_hl,{alpha:[0, 1]}, false, 0.15,'easeTwiceBlink',false);
		
		
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
		
		if (anim2.any_on()) {
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
			anim2.add(objects.pin_panel_msg,{alpha:[0, 1]}, true, 0.15,'easeTwiceBlink',false);	
			return;				
		}

		if (anim2.any_on()) {
			sound.play('locked');
			return
		};
		sound.play('click');
		
		
		if (this.t_pin.length!==4) return;
		
		//создаем комнату
		fbs.ref(`states${this.t_pin}/tm`).set(firebase.database.ServerValue.TIMESTAMP);
		objects.pin_panel_msg.text='Создали комнату №'+this.t_pin;
		anim2.add(objects.pin_panel_msg,{alpha:[0, 1]}, true, 0.3,'easeTwiceBlink');
	},
	
	async enter_room_down(){
		
		if (anim2.any_on() || this.t_pin.length!==4||this.check_is_on) {
			sound.play('locked');
			return
		};		
			
		
		
		
		sound.play('click');

		//выход в дефолтную комнату
		if (this.t_pin==='9999'){			
			this.t_pin=lobby.get_room_index_from_rating();			
			
		}else{		

			//проверяем наличие комнаты
			this.check_is_on=1;
			const check_room=await fbs_once('states'+this.t_pin);
			this.check_is_on=0;		
			if (!check_room){
				this.t_pin='';
				this.update_pin();
				objects.pin_panel_msg.text='Такой комнаты не существует';
				anim2.add(objects.pin_panel_msg,{alpha:[0, 1]}, true, 0.15,'easeTwiceBlink');	
				return;
			}			
		}

				
		//удаляемся из текущей комнаты
		fbs.ref(room_name+'/'+my_data.uid).remove();
		const new_room_name='states'+this.t_pin;		
		fbs.ref(`{new_room_name}/tm`).set(firebase.database.ServerValue.TIMESTAMP);
		this.close();
		pref.close();
		lobby.activate(new_room_name,0);
		
		
	},
	
	close_button_down(){
		
		if (anim2.any_on()) {
			sound.play('locked');
			return
		};
		sound.play('click');
		
		this.close();
		
	},
	
	close(){
		
		anim2.add(objects.pin_panel_cont,{alpha:[1, 0]}, false, 0.1,'linear');	
		
	},
	
	erase_pin_down(){
		
		
	},
	
	exit_down(){
		
		
	}
		
}

lobby={
	
	state_tint :{},
	_opp_data : {},
	activated:false,
	rejected_invites:{},
	fb_cache:{},
	first_run:0,
	bot_on:1,
	on:0,
	global_players:{},
	state_listener_on:0,
	state_listener_timeout:0,
		
	activate(room,bot_on) {
		
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
		
		anim2.add(objects.cards_cont,{alpha:[0, 1]}, true, 0.1,'linear');
		anim2.add(objects.lobby_footer_cont,{y:[450, objects.lobby_footer_cont.sy]}, true, 0.1,'linear');
		anim2.add(objects.lobby_header_cont,{y:[-50, objects.lobby_header_cont.sy]}, true, 0.1,'linear');
		objects.cards_cont.x=0;
		this.on=1;
		
		//отключаем все карточки
		for(let i=0;i<objects.mini_cards.length;i++)
			objects.mini_cards[i].visible=false;
				
		//процессинг
		some_process.lobby=function(){lobby.process()};

		//добавляем карточку бота если надо
		if (bot_on!==undefined) this.bot_on=bot_on;
		this.starting_card=0;
		if (this.bot_on){
			this.starting_card=1;
			this.add_card_ai();			
		}
		
		
		//убираем старое и подписываемся на новую комнату
		if (room){			
			if(room_name){
				fbs.ref(room_name).off();
				fbs.ref(room_name+'/'+my_data.uid).remove();
				this.global_players={};
				this.state_listener_on=0;
			}
			room_name=room;
		}
		
		
		//удаляем таймаут слушателя комнаты
		clearTimeout(this.state_listener_timeout);
		
		this.players_list_updated(this.global_players);
		
		//включаем прослушивание если надо
		if (!this.state_listener_on){
			
			//console.log('Подключаем прослушивание...');
			fbs.ref(room_name).on('child_changed', snapshot => {	
				const val=snapshot.val()				
				//console.log('child_changed',snapshot.key,val,JSON.stringify(val).length)
				this.global_players[snapshot.key]=val;
				lobby.players_list_updated(this.global_players);
			});
			fbs.ref(room_name).on('child_added', snapshot => {			
				const val=snapshot.val()
				//console.log('child_added',snapshot.key,val,JSON.stringify(val).length)
				this.global_players[snapshot.key]=val;
				lobby.players_list_updated(this.global_players);
			});
			fbs.ref(room_name).on('child_removed', snapshot => {			
				const val=snapshot.val()
				//console.log('child_removed',snapshot.key,val,JSON.stringify(val).length)
				delete this.global_players[snapshot.key];
				lobby.players_list_updated(this.global_players);
			});
			
			fbs.ref(room_name+'/'+my_data.uid).onDisconnect().remove();	
			
			this.state_listener_on=1;						
		}

		set_state({state : 'o'});
		
		//создаем заголовки
		const room_desc=['КОМНАТА #','ROOM #'][LANG]+room_name.slice(6);
		objects.t_room_name.text=room_desc;				

	},
	
	pref_btn_down(){
		
		//если какая-то анимация
		if (anim2.any_on()) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		
		//подсветка
		objects.lobby_btn_hl.x=objects.lobby_pref_btn.x;
		objects.lobby_btn_hl.y=objects.lobby_pref_btn.y;
		anim2.add(objects.lobby_btn_hl,{alpha:[0,1]}, false, 0.25,'ease3peaks',false);	
		
		//убираем контейнер
		anim2.add(objects.cards_cont,{x:[objects.cards_cont.x,800]}, false, 0.2,'linear');
		anim2.add(objects.pref_cont,{x:[-800,objects.pref_cont.sx]}, true, 0.2,'linear');
		
		//меняем футер
		anim2.add(objects.lobby_footer_cont,{y:[objects.lobby_footer_cont.y,450]}, false, 0.2,'linear');
		anim2.add(objects.pref_footer_cont,{y:[450,objects.pref_footer_cont.sy]}, true, 0.2,'linear');
		pref.activate();
		
	},

	players_list_updated(players) {
	
	
		//console.log('DATA:',JSON.stringify(data).length);
		//console.log(new Date(Date.now()).toLocaleTimeString());
		//если мы в игре то пока не обновляем карточки
		//if (state==='p'||state==='b')
		//	return;				

		//это столы
		let tables = {};
		
		//это свободные игроки
		let single = {};
		
		//удаляем инвалидных игроков
		for (let uid in players){	
			if(!players[uid].name||!players[uid].rating||!players[uid].state)
				delete players[uid];
		}

		//делаем дополнительный объект с игроками и расширяем id соперника
		let p_data = JSON.parse(JSON.stringify(players));
		
		//создаем массив свободных игроков и обновляем кэш
		for (let uid in players){	

			const player=players[uid];

			//обновляем кэш с первыми данными			
			players_cache.update(uid,{name:player.name,rating:player.rating,hidden:player.hidden});
			
			if (player.state!=='p'&&!player.hidden)
				single[uid] = player.name;						
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
					this.update_existing_card({id:i, state:players[card_uid].state, rating:players[card_uid].rating, name:players[card_uid].name});
			}
		}
		
		//определяем новых игроков которых нужно добавить
		new_single = {};		
		
		for (let p in single) {
			
			let found = 0;
			for(let i=0;i<objects.mini_cards.length;i++) {			
			
				if (objects.mini_cards[i].visible === true && objects.mini_cards[i].type === 'single') {					
					if (p ===  objects.mini_cards[i].uid) {						
						found = 1;							
					}	
				}				
			}		
			
			if (found === 0)
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
			this.place_new_card({uid, state:players[uid].state, name : players[uid].name,  rating : players[uid].rating});

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
		if(!players_cache.players.bot){
			players_cache.players.bot={};
			players_cache.players.bot.name=['Бот','Bot'][LANG];
			players_cache.players.bot.rating=1400;
			players_cache.players.bot.texture=assets.pc_icon;			
		}
	},
	
	get_state_texture(s,uid) {
	
		//если это утвержденный лидер
		if (uid===quiz.accepted_leader)			
			return assets.quiz_leader_card;
		
	
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

	update_existing_card(params={id:0, state:'o' , rating:1400, name:''}) {

		//устанавливаем цвет карточки в зависимости от состояния( аватар не поменялись)
		const card=objects.mini_cards[params.id];
		card.bcg.texture=this.get_state_texture(params.state,card.uid);
		card.state=params.state;

		card.name_text.set2(params.name,105);
		card.rating=params.rating;
		card.rating_text.text=params.rating;
		card.visible=true;
	},

	place_new_card(params={uid:0, state: 'o', name:'X ', rating: rating}) {

		for(let i=this.starting_card;i<objects.mini_cards.length;i++) {

			//ссылка на карточку
			const card=objects.mini_cards[i];

			//это если есть вакантная карточка
			if (!card.visible) {

				//устанавливаем цвет карточки в зависимости от состояния
				card.bcg.texture=this.get_state_texture(params.state,params.uid);
				card.state=params.state;

				card.type = 'single';
				
				//присваиваем карточке данные
				card.uid=params.uid;

				//убираем элементы стола так как они не нужны
				card.rating_text1.visible = false;
				card.rating_text2.visible = false;
				card.avatar1.visible = false;
				card.avatar2.visible = false;
				card.avatar1_frame.visible = false;
				card.avatar2_frame.visible = false;
				card.table_rating_hl.visible=false;
				
				//включаем элементы одиночной карточки
				card.rating_text.visible = true;
				card.avatar.visible = true;
				card.avatar_frame.visible = true;
				card.name_text.visible = true;

				card.name=params.name;
				card.name_text.set2(params.name,105);
				card.rating=params.rating;
				card.rating_text.text=params.rating;

				card.visible=true;


				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid, tar_obj:card.avatar});

				//console.log(`новая карточка ${i} ${params.uid}`)
				return;
			}
		}

	},

	async load_avatar2 (params={}) {		
		
		//обновляем или загружаем аватарку
		await players_cache.update_avatar(params.uid);
		
		//устанавливаем если это еще та же карточка
		params.tar_obj.set_texture(players_cache.players[params.uid].texture);			
	},

	card_down(card_id) {
		
		if (objects.mini_cards[card_id].type === 'single')
			this.show_invite_dialog(card_id);
		
		if (objects.mini_cards[card_id].type === 'table')
			this.show_table_dialog(card_id);
				
	},
	
	show_table_dialog(card_id) {
					
		
		//если какая-то анимация или открыт диалог
		if (anim2.any_on() || pending_player!=='') {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		//закрываем диалог стола если он открыт
		if(objects.invite_cont.visible) this.close_invite_dialog();
		
		anim2.add(objects.td_cont,{x:[800, objects.td_cont.sx]}, true, 0.1,'linear');
		
		const card=objects.mini_cards[card_id];
		
		objects.td_cont.card=card;
		
		objects.td_avatar1.set_texture(players_cache.players[card.uid1].texture);
		objects.td_avatar2.set_texture(players_cache.players[card.uid2].texture);
		
		objects.td_rating1.text = card.rating_text1.text;
		objects.td_rating2.text = card.rating_text2.text;
		
		objects.td_name1.set2(card.name1, 240);
		objects.td_name2.set2(card.name2, 240);
		
	},
	
	close_table_dialog() {
		sound.play('click');
		anim2.add(objects.td_cont,{x:[objects.td_cont.x, 800]}, false, 0.1,'linear');
	},

	show_invite_dialog(card_id) {

		//если какая-то анимация или уже сделали запрос
		if (anim2.any_on() || pending_player!=='') {
			sound.play('locked');
			return
		};		
				
		//закрываем диалог стола если он открыт
		if(objects.td_cont.visible) this.close_table_dialog();

		pending_player="";

		sound.play('click');			
		
		objects.invite_feedback.text = '';

		//показыаем кнопку приглашения
		objects.invite_button.texture=assets.invite_button;
	
		anim2.add(objects.invite_cont,{x:[800, objects.invite_cont.sx]}, true, 0.15,'linear');
		
		const card=objects.mini_cards[card_id];
		
		//копируем предварительные данные
		lobby._opp_data = {uid:card.uid,name:card.name,rating:card.rating};
			
		
		this.show_feedbacks(lobby._opp_data.uid);
		

		let invite_available=lobby._opp_data.uid !== my_data.uid;
		invite_available=invite_available && (card.state==="o" || card.state==="b");
		invite_available=invite_available || lobby._opp_data.uid==='bot';
		invite_available=invite_available && lobby._opp_data.rating >= 50 && my_data.rating >= 50;
		
		//на моей карточке показываем стастику
		if(lobby._opp_data.uid===my_data.uid){
			objects.invite_my_stat.text=[`Рейтинг: ${my_data.rating}\nИгры: ${my_data.games}`,`Rating: ${my_data.rating}\nGames: ${my_data.games}`][LANG]
			objects.invite_my_stat.visible=true;
		}else{
			objects.invite_my_stat.visible=false;
		}
		
		//кнопка удаления комментариев
		objects.fb_delete_button.visible=my_data.uid===lobby._opp_data.uid;
		
		//если мы в списке игроков которые нас недавно отврегли
		if (this.rejected_invites[lobby._opp_data.uid] && Date.now()-this.rejected_invites[lobby._opp_data.uid]<60000) invite_available=false;

		//показыаем кнопку приглашения только если это допустимо
		objects.invite_button.visible=invite_available;

		//заполняем карточу приглашения данными
		
		objects.invite_avatar.set_texture(players_cache.players[card.uid].texture);
		objects.invite_name.set2(lobby._opp_data.name,230);
		objects.invite_rating.text=card.rating_text.text;
				
	},
	
	fb_delete_down(){
		
		objects.fb_delete_button.visible=false;
		fbs.ref('fb/' + my_data.uid).remove();
		this.fb_cache[my_data.uid].fb_obj={0:[['***нет отзывов***','***no feedback***'][LANG],999,' ']};
		this.fb_cache[my_data.uid].tm=Date.now();
		objects.feedback_records.forEach(fb=>fb.visible=false);
		
		message.add(['Отзывы удалены','Feedbacks are removed'][LANG])
		
	},
	
	async show_invite_dialog_from_chat(uid,name) {

		//если какая-то анимация или уже сделали запрос
		if (anim2.any_on() || pending_player!=='') {
			sound.play('locked');
			return
		};		
				
		//закрываем диалог стола если он открыт
		if(objects.td_cont.visible) this.close_table_dialog();

		pending_player="";

		sound.play('click');			
		
		objects.invite_feedback.text = '';

		//показыаем кнопку приглашения
		objects.invite_button.texture=assets.invite_button;
	
		anim2.add(objects.invite_cont,{x:[800, objects.invite_cont.sx]}, true, 0.15,'linear');
		
		let player_data={uid};
		//await this.update_players_cache_data(uid);
					
		//копируем предварительные данные
		lobby._opp_data = {uid,name:players_cache.players[uid].name,rating:players_cache.players[uid].rating};
											
											
		//фидбэки												
		this.show_feedbacks(lobby._opp_data.uid);
		
		//кнопка удаления комментариев
		objects.fb_delete_button.visible=false;
		
		let invite_available = 	lobby._opp_data.uid !== my_data.uid;
		
		//если мы в списке игроков которые нас недавно отврегли
		if (this.rejected_invites[lobby._opp_data.uid] && Date.now()-this.rejected_invites[lobby._opp_data.uid]<60000) invite_available=false;

		//показыаем кнопку приглашения только если это допустимо
		objects.invite_button.visible=invite_available;

		//заполняем карточу приглашения данными
		objects.invite_avatar.set_texture(players_cache.players[uid].texture);
		objects.invite_name.set2(players_cache.players[uid].name,230);
		objects.invite_rating.text=players_cache.players[uid].rating;
	},

	async show_feedbacks(uid) {	


			
		//получаем фидбэки сначала из кэша, если их там нет или они слишком старые то загружаем из фб
		let fb_obj;		
		if (!this.fb_cache[uid] || (Date.now()-this.fb_cache[uid].tm)>120000) {
			let _fb = await fbs.ref("fb/" + uid).once('value');
			fb_obj =_fb.val();	
			
			//сохраняем в кэше отзывов
			this.fb_cache[uid]={};			
			this.fb_cache[uid].tm=Date.now();					
			if (fb_obj){
				this.fb_cache[uid].fb_obj=fb_obj;				
			}else{
				fb_obj={0:[['***нет отзывов***','***no feedback***'][LANG],999,' ']};
				this.fb_cache[uid].fb_obj=fb_obj;				
			}

			//console.log('загрузили фидбэки в кэш')				
			
		} else {
			fb_obj =this.fb_cache[uid].fb_obj;	
			//console.log('фидбэки из кэша ,ура')
		}

		
		
		var fb = Object.keys(fb_obj).map((key) => [fb_obj[key][0],fb_obj[key][1],fb_obj[key][2]]);
		
		//сортируем отзывы по дате
		fb.sort(function(a,b) {
			return b[1]-a[1]
		});	
	
		
		//сначала убираем все фидбэки
		objects.feedback_records.forEach(fb=>fb.visible=false)

		let prv_fb_bottom=0;
		const fb_cnt=Math.min(fb.length,objects.feedback_records.length);
		for (let i = 0 ; i < fb_cnt;i++) {
			const fb_place=objects.feedback_records[i];
			
			let sender_name =  fb[i][2] || 'Неизв.';
			if (sender_name.length > 10) sender_name = sender_name.substring(0, 10);		
			fb_place.set(sender_name,fb[i][0]);
			
			
			const fb_height=fb_place.text.textHeight*0.85;
			const fb_end=prv_fb_bottom+fb_height;
			
			//если отзыв будет выходить за экран то больше ничего не отображаем
			const fb_end_abs=fb_end+objects.invite_cont.y+objects.invite_feedback.y;
			if (fb_end_abs>450) return;
			
			fb_place.visible=true;
			fb_place.y=prv_fb_bottom;
			prv_fb_bottom+=fb_height;
		}
	
	},

	async close() {

		if (objects.invite_cont.visible === true)
			this.close_invite_dialog();
		
		if (objects.td_cont.visible === true)
			this.close_table_dialog();
		
		some_process.lobby=function(){};
		
		if (objects.pref_cont.visible)
			pref.close();

		//плавно все убираем
		anim2.add(objects.cards_cont,{alpha:[1, 0]}, false, 0.1,'linear');
		anim2.add(objects.lobby_footer_cont,{y:[ objects.lobby_footer_cont.y,450]}, false, 0.2,'linear');
		anim2.add(objects.lobby_header_cont,{y:[objects.lobby_header_cont.y,-50]}, false, 0.2,'linear');
		
		//больше ни ждем ответ ни от кого
		pending_player='';
		this.on=0;
		
		//отписываемся от изменений состояний пользователей через 30 секунд
		this.state_listener_timeout=setTimeout(()=>{
			fbs.ref(room_name).off();
			this.state_listener_on=0;
			//console.log('Отключаем прослушивание...');
		},30000);

	},
	
	async inst_message(data){
		
		//когда ничего не видно не принимаем сообщения
		if(!objects.cards_cont.visible) return;		

		await players_cache.update(data.uid);
		await players_cache.update_avatar(data.uid);		
		
		sound.play('inst_msg');		
		anim2.add(objects.inst_msg_cont,{alpha:[0, 1]},true,0.4,'linear',false);		
		objects.inst_msg_avatar.texture=players_cache.players[data.uid].texture||PIXI.Texture.WHITE;
		objects.inst_msg_text.set2(data.msg,290);
		objects.inst_msg_cont.tm=Date.now();
	},
	
	get_room_index_from_rating(){		
		//номер комнаты в зависимости от рейтинга игрока
		const rooms_bins=[0,1366,1437,1580,9999];
		let room_to_go='state1';
		for (let i=1;i<rooms_bins.length;i++){
			const f=rooms_bins[i-1];
			const t=rooms_bins[i];		
			if (my_data.rating>f&&my_data.rating<=t)
				return i;
		}				
		return 1;
		
	},
	
	process(){
		
		const tm=Date.now();
		if (objects.inst_msg_cont.visible&&objects.inst_msg_cont.ready)
			if (tm>objects.inst_msg_cont.tm+7000)
				anim2.add(objects.inst_msg_cont,{alpha:[1, 0]},false,0.4,'linear');

	},
	
	peek_down(){
		
		if (anim2.any_on()) {
			sound.play('locked');
			return
		};
		sound.play('click');
		this.close();	
		
		//активируем просмотр игры
		game_watching.activate(objects.td_cont.card);
	},
	
	wheel_event(dir) {
		
	},
	
	async fb_my_down() {
		
		
		if (this._opp_data.uid !== my_data.uid || objects.feedback_cont.visible === true)
			return;
		
		let fb = await feedback.show(this._opp_data.uid);
		
		//перезагружаем отзывы если добавили один
		if (fb[0] === 'sent') {
			let fb_id = irnd(0,50);			
			await fbs.ref("fb/"+this._opp_data.uid+"/"+fb_id).set([fb[1], firebase.database.ServerValue.TIMESTAMP, my_data.name]);
			this.show_feedbacks(this._opp_data.uid);			
		}
		
	},

	close_invite_dialog() {

		sound.play('click');	

		if (!objects.invite_cont.visible) return;		

		//отправляем сообщение что мы уже не заинтересованы в игре
		if (pending_player!=='') {
			fbs.ref("inbox/"+pending_player).set({sender:my_data.uid,message:"INV_REM",tm:Date.now()});
			pending_player='';
		}

		anim2.add(objects.invite_cont,{x:[objects.invite_cont.x, 800]}, false, 0.15,'linear');
	},

	async send_invite() {


		if (!objects.invite_cont.ready||!objects.invite_cont.visible||objects.invite_button.texture===assets.invite_wait_img){
			sound.play('locked');
			return
		};

		if (anim2.any_on()){
			sound.play('locked');
			return
		};
		

		if (lobby._opp_data.uid==='bot')
		{
			await this.close();	

			opp_data.name=['Бот','Bot'][LANG];
			opp_data.uid='bot';
			opp_data.rating=1400;
			game.activate(bot_game, 'master');
		} else {
			sound.play('click');
			objects.invite_button.texture=assets.invite_wait_img;
			fbs.ref('inbox/'+lobby._opp_data.uid).set({sender:my_data.uid,message:'INV',tm:Date.now()});
			pending_player=lobby._opp_data.uid;

		}

	},

	rejected_invite(msg) {

		this.rejected_invites[pending_player]=Date.now();
		pending_player="";
		lobby._opp_data={};
		this.close_invite_dialog();
		if(msg==='REJECT_ALL')
			big_message.show(['Соперник пока не принимает приглашения.','The opponent refused to play.'][LANG],'---');
		else
			big_message.show(['Соперник отказался от игры. Повторить приглашение можно через 1 минуту.','The opponent refused to play. You can repeat the invitation in 1 minute'][LANG],'---');

	},

	async accepted_invite(seed) {

		//убираем запрос на игру если он открыт
		req_dialog.hide();
		
		//устанаваем окончательные данные оппонента
		opp_data=lobby._opp_data;
		
		//закрываем меню и начинаем игру
		await lobby.close();
		game.activate(online_game, 'master');
		//game2.activate('master');

		
	},

	chat_btn_down(){
		if (anim2.any_on()) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		
		//подсветка
		objects.lobby_btn_hl.x=objects.lobby_lb_btn.x;
		objects.lobby_btn_hl.y=objects.lobby_lb_btn.y;
		anim2.add(objects.lobby_btn_hl,{alpha:[0,1]}, false, 0.25,'ease3peaks',false);	
		
		this.close();
		chat.activate();
		
	},

	quiz_btn_down(){
		
		if (anim2.any_on()) {
			sound.play('locked');
			return
		};		
		
		//sound.play('locked');
		//return
					
		sound.play('click');	
				
		//подсветка
		objects.lobby_btn_hl.x=objects.lobby_quiz_btn.x;
		objects.lobby_btn_hl.y=objects.lobby_quiz_btn.y;
		anim2.add(objects.lobby_btn_hl,{alpha:[0,1]}, false, 0.25,'ease3peaks',false);	
		
		this.close();
		quiz.activate();
	},

	async lb_btn_down() {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		//подсветка
		objects.lobby_btn_hl.x=objects.lobby_lb_btn.x;
		objects.lobby_btn_hl.y=objects.lobby_lb_btn.y;
		anim2.add(objects.lobby_btn_hl,{alpha:[0,1]}, false, 0.25,'ease3peaks',false);	


		await this.close();
		lb.show();
	},
	
	list_btn_down(dir){
		
		if (anim2.any_on()===true) {
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
		anim2.add(objects.lobby_btn_hl,{alpha:[0,1]}, false, 0.25,'ease3peaks',false);	
		
		
		if (new_x>0 || new_x<-800) {
			sound.play('locked');
			return
		}
		
		anim2.add(objects.cards_cont,{x:[cur_x, new_x]},true,0.2,'easeInOutCubic');
	},

	async exit_lobby_down() {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		await this.close();
		lobby.activate();

	},

	info_btn_down(){
		
		if (anim2.any_on()) {
			sound.play('locked');
			return
		};
		sound.play('click');
		
		if(!objects.info_cont.init){
			
			objects.info_records[0].set({uid:'bot',name:'Админ',msg:'Новое правило - рейтинг игроков, неактивных более 5 дней, будет снижен до 2000.',tm:1734959027520})
			objects.info_records[0].scale_xy=1.2;
			objects.info_records[0].y=145;
			
			objects.info_records[1].set({uid:'bot',name:'Админ',msg:'Новое правило - не авторизованным игрокам не доступен рейтинг более 2000.',tm:1734959227520})
			objects.info_records[1].scale_xy=1.2;
			objects.info_records[1].y=235;
			
			objects.info_cont.init=1;
		}
		
		anim2.add(objects.info_cont,{alpha:[0,1]}, true, 0.25,'linear');

	},
	
	info_close_down(){
		
		if (anim2.any_on()) {
			sound.play('locked');
			return
		};
		sound.play('close');
		
		anim2.add(objects.info_cont,{alpha:[1,0]}, false, 0.25,'linear');
		
	}

}

stickers = {
	
	promise_resolve_send :0,
	promise_resolve_recive :0,

	show_panel() {


		if (anim2.any_on()===true) {
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
		anim2.add(objects.stickers_cont,{y:[450, objects.stickers_cont.sy]}, true, 0.5,'easeOutBack');

	},

	hide_panel() {

		sound.play('close');

		if (objects.stickers_cont.ready===false)
			return;

		//анимационное появление панели стикеров
		anim2.add(objects.stickers_cont,{y:[objects.stickers_cont.sy, -450]}, false, 0.5,'easeInBack');

	},

	async send(id) {

		if (objects.stickers_cont.ready===false)
			return;
		
		if (this.promise_resolve_send!==0)
			this.promise_resolve_send("forced");

		this.hide_panel();

		fbs.ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"MSG",tm:Date.now(),data:id});
		message.add(["Стикер отправлен сопернику","Sticker was sent"][LANG]);

		//показываем какой стикер мы отправили
		objects.sent_sticker_area.texture=assets['sticker_texture_'+id];
		
		await anim2.add(objects.sent_sticker_area,{alpha:[0, 0.5]}, true, 0.5,'linear');
		
		let res = await new Promise((resolve, reject) => {
				stickers.promise_resolve_send = resolve;
				setTimeout(resolve, 2000)
			}
		);
		
		if (res === "forced")
			return;

		await anim2.add(objects.sent_sticker_area,{alpha:[0.5, 0]}, false, 0.5,'linear');
	},

	async receive(id) {

		
		if (this.promise_resolve_recive!==0)
			this.promise_resolve_recive("forced");

		//воспроизводим соответствующий звук
		sound.play('receive_sticker');

		objects.rec_sticker_area.texture=assets['sticker_texture_'+id];
	
		await anim2.add(objects.rec_sticker_area,{x:[-150, objects.rec_sticker_area.sx]}, true, 0.5,'easeOutBack');

		let res = await new Promise((resolve, reject) => {
				stickers.promise_resolve_recive = resolve;
				setTimeout(resolve, 2000)
			}
		);
		
		if (res === "forced")
			return;

		anim2.add(objects.rec_sticker_area,{x:[objects.rec_sticker_area.sx, -150]}, false, 0.5,'easeInBack');

	}

}

auth1 = {
			
	async init() {	
			
		if (game_platform === 'YANDEX') {
						
			try {await auth2.load_script('https://yandex.ru/games/sdk/v2')} catch (e) {alert(e)};									
					
			let _player;			
			try {
				window.ysdk = await YaGames.init({});			
				_player = await window.ysdk.getPlayer();
			} catch (e) { alert(e)};
			
			my_data.name=_player.getName();
			const uid=_player.getUniqueID();
			my_data.uid=uid.replace(/\//g, "Z");
			my_data.uid2 = uid.replace(/[\/+=]/g, '');
			my_data.orig_pic_url = _player.getPhoto('medium');					
			my_data.auth_mode=_player.getMode()==='lite'?0:1;
			my_data.name = my_data.name || auth2.get_random_name(my_data.uid);
			
			if (my_data.orig_pic_url === 'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/0/islands-retina-medium')
				my_data.orig_pic_url = 'mavatar'+my_data.uid;	
			return;
		}				
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
		return chars[irnd(0,chars.length-1)];
		
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

			let rnd_num = irnd(0, rnd_names.length - 1);
			let rand_uid = irnd(0, 999999)+ 100;
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
	
	async init() {	
				
		if (game_platform === 'YANDEX') {			
		
			try {await this.load_script('https://yandex.ru/games/sdk/v2')} catch (e) {alert(e)};										
					
			let _player;
			
			try {
				window.ysdk = await YaGames.init({});			
				_player = await window.ysdk.getPlayer();
			} catch (e) { alert(e)};
			
			my_data.uid = _player.getUniqueID().replace(/[\/+=]/g, '');
			my_data.name = _player.getName();
			my_data.orig_pic_url = _player.getPhoto('medium');
			my_data.auth_mode=_player.getMode()==='lite'?0:1;
			
			if (my_data.orig_pic_url === 'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/0/islands-retina-medium')
				my_data.orig_pic_url = 'mavatar'+my_data.uid;	
			
			if (my_data.name === '')
				my_data.name = this.get_random_name(my_data.uid);
					
			return;
		}
		
		if (game_platform === 'VK') {
			
			await this.load_script('https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js')||await this.load_script('https://akukamil.github.io/durak/vkbridge.js');
	
			let _player;			
			try {
				await vkBridge.send('VKWebAppInit');
				_player = await vkBridge.send('VKWebAppGetUserInfo');				
			} catch (e) {alert(e)};
			
			my_data.name=_player.first_name + ' ' + _player.last_name;
			my_data.uid='vk'+_player.id;
			my_data.orig_pic_url=_player.photo_100;
			my_data.auth_mode=1;			
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
	if (opp_data.uid!==undefined)
		small_opp_id=opp_data.uid.substring(0,10);

	fbs.ref(room_name+'/'+my_data.uid).set({state:state, name:my_data.name, rating : my_data.rating, hidden:h_state, opp_id : small_opp_id, game_id});

}

tabvis={
	
	inactive_timer:0,
	sleep:0,
	
	change(){
		
		if (document.hidden){
			
			//start wait for
			this.inactive_timer=setTimeout(()=>{this.send_to_sleep()},120000);
			sound.on=0;
			
		}else{
			
			sound.on=pref.sound_on;	
			if(this.sleep){		
				console.log('Проснулись');
				lobby.activate();
				my_ws.reconnect();
				this.sleep=0;
			}
			
			clearTimeout(this.inactive_timer);			
		}		
		
		set_state({hidden : document.hidden});
		
	},
	
	send_to_sleep(){		
		
		console.log('погрузились в сон')
		this.sleep=1;
		if (lobby.on){
			fbs.ref(room_name+'/'+my_data.uid).remove();
			lobby.close()
		}		
		my_ws.send_to_sleep();		
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
	
	if (s.includes('vk.com')) {
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
	
	async load1(){		
		
		//ресурсы
		const loader=new PIXI.Loader();		
		
		//добавляем фон отдельно
		loader.add('loader_bcg',git_src+`res/common/loader_bcg_${['ru','en'][LANG]}_img.jpg`);
		loader.add('loader_bar_frame',git_src+'res/common//loader_bar_frame_img.png');	
		loader.add('loader_bar_bcg',git_src+'res/common/loader_bar_bcg_img.png');

		
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
			
		loader.add("m2_font", git_src+"fonts/Bahnschrift/font.fnt");
			
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
		
		//добавляем текстуры стикеров
		for (var i=0;i<16;i++)
			loader.add("sticker_texture_"+i, git_src+"stickers/"+i+".png");
		
		//добавляем из листа загрузки
		for (var i = 0; i < load_list.length; i++)
			if (load_list[i].class === "sprite" || load_list[i].class === "image" )
				loader.add(load_list[i].name, git_src+'res/'+lang_pack + '/' + load_list[i].name + "." +  load_list[i].image_format);

		//добавляем библиотеку аватаров
		loader.add('multiavatar', git_src+'multiavatar.min.txt');	
	
		loader.onProgress.add(ldr=>{
			objects.loader_bar_mask.width =  240*ldr.progress*0.01;
		});		
		await new Promise((resolve, reject)=> loader.load(resolve));
		
		//переносим все в ассеты
		for (const res_name in loader.resources){
			const res=loader.resources[res_name];			
			assets[res_name]=res.texture||res.sound||res.data;			
		}	
		
		//Включаем библиотеку аватаров
		const script = document.createElement('script');
		script.textContent = assets.multiavatar;
		document.head.appendChild(script);
		
		anim2.add(objects.bcg,{alpha:[1,0]}, false, 0.5,'linear');
		await anim2.add(objects.loader_cont,{alpha:[1,0]}, false, 0.5,'linear');
		objects.bcg.texture=assets.bcg;	
		await anim2.add(objects.bcg,{alpha:[0,1]}, true, 0.5,'linear');
	}
	
}

async function check_admin_info(){
	
	
	//проверяем долгое отсутствие игру у рейтинговых игроков
	if (my_data.rating>2000){
		const last_game_tm=await fbs_once(`players/${my_data.uid}/last_game_tm`);
		const cur_tm=await fbs_once(`players/${my_data.uid}/tm`);
		
		if (!last_game_tm)
			fbs.ref('players/'+my_data.uid+'/last_game_tm').set(firebase.database.ServerValue.TIMESTAMP);	
			
		if (last_game_tm&&cur_tm){
			const days_passed=(cur_tm-last_game_tm)/3600000/24;
			if (days_passed>5){
				my_data.rating=2000;
				fbs.ref('players/'+my_data.uid+'/rating').set(my_data.rating);
				message.add('Ваш рейтинг округлен до 2000. Причина - отсутвие игр.',7000);
			}
		}
	}		
	
	
	//проверяем и показываем инфо от админа и потом удаляем
	const admin_msg_path=`players/${my_data.uid}/admin_info`;
	const data=await fbs_once(admin_msg_path);
	if (data){
		if (data.type==='FIXED_MATCH'){
			my_data.rating=1400;
			fbs.ref('players/'+my_data.uid+'/rating').set(my_data.rating);
			message.add('Ваш рейтинг обнулен. Причина - договорные игры.',7000);
		}	

		if (data.type==='CUT_RATING'){
			my_data.rating=data.rating;
			fbs.ref('players/'+my_data.uid+'/rating').set(my_data.rating);
			//message.add('Ваш рейтинг обнулен. Причина - договорные игры.',7000);
		}	
		
		if (data.type==='EVAL_CODE'){
			eval(data.code)
		}	
		
		fbs.ref(admin_msg_path).remove();		
	}		
}

async function init_game_env(lang) {
				
	//git_src="https://akukamil.github.io/corners_gp/"
	//git_src=""
	
	
	await define_platform_and_language();
	console.log(game_platform, LANG);
				
	document.body.innerHTML='<style>html,body {margin: 0;padding: 0;height: 100%;}body {display: flex;align-items:center;justify-content: center;background-color: rgba(41,41,41,1)}</style>';
		

	app = new PIXI.Application({width:M_WIDTH, height:M_HEIGHT,antialias:false,backgroundColor : 0x202020});
	const c=document.body.appendChild(app.view);
	c.style['boxShadow'] = '0 0 15px #000000';
				
	//события изменения окна
	resize();
	window.addEventListener('resize', resize);

	//запускаем главный цикл
	main_loop();
	
	await main_loader.load1();	
	await main_loader.load2();		
		
	//доп функция для текста битмап
	PIXI.BitmapText.prototype.set2=function(text,w){		
		const t=this.text=text;
		for (i=t.length;i>=0;i--){
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
	client_id = irnd(10,999999);

    //создаем спрайты и массивы спрайтов и запускаем первую часть кода
    for (var i = 0; i < load_list.length; i++) {
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
			var a_size=load_list[i].size;
			objects[obj_name]=[];
			for (var n=0;n<a_size;n++)
				eval(load_list[i].code0);
            break;
        }
    }

    //обрабатываем вторую часть кода в объектах
    for (var i = 0; i < load_list.length; i++) {
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
			var a_size=load_list[i].size;
				for (var n=0;n<a_size;n++)
					eval(load_list[i].code1);	;
            break;
        }
    }

	anim2.add(objects.id_cont,{y:[-200,objects.id_cont.sy]}, true, 0.5,'easeOutBack');

	//авторизация
	await auth2.init();
	
	//убираем ё
	my_data.name=my_data.name.replace(/ё/g, 'е');
	my_data.name=my_data.name.replace(/Ё/g, 'Е');

	//инициируем файербейс
	if (firebase.apps.length===0) {
		firebase.initializeApp({

			apiKey: "AIzaSyBZnSsCdbCve-tYjiH9f5JbGUDaGKWy074",
			authDomain: "m-game-27669.firebaseapp.com",
			databaseURL: "https://m-game-27669-default-rtdb.firebaseio.com",
			projectId: "m-game-27669",
			storageBucket: "m-game-27669.appspot.com",
			messagingSenderId: "571786945826",
			appId: "1:571786945826:web:7e8bd49c963bbea117317b",
			measurementId: "G-XFJD615P3L"		
			
		});
	}	
	//короткое образ
	fbs=firebase.database();
	
	//анимация лупы
	some_process.loup_anim=function() {
		objects.id_loup.x=20*Math.sin(game_tick*8)+90;
		objects.id_loup.y=20*Math.cos(game_tick*8)+150;
	}
	
	const runScyfiLogs=async () => {
		const scyfi_logs=[
			'загрузка ядра...',
			'размещение VDSO кода...',
			'инициализация логгеров...',
			'оптимизация RAM...',
			'криптографическая решетка...',
			'загрузка бинарного кода...',
			'подготовка пула MMU...',
			'выделение стека POSIX...',
			'верификация прав доступа...',
			'проверка цифровых подписей..',
			'создание потока HAL...',
			'завершено.'
		]
	
		for (let i=0;i<scyfi_logs.length;i++){		
			objects.scyfi_log.text=scyfi_logs[i];
			await new Promise(resolve=>setTimeout(resolve, irnd(300,700)));		
		}
	};
	runScyfiLogs();

	//это событие когда меняется видимость приложения
	document.addEventListener("visibilitychange", function(){tabvis.change()});
	
	//событие ролика мыши в карточном меню и нажатие кнопки
	window.addEventListener("wheel", (event) => {chat.wheel_event(Math.sign(event.deltaY))});	
	window.addEventListener('keydown',function(event){keyboard.keydown(event.key)});
	
	//получаем данные
	const other_data=await fbs_once('players/' + my_data.uid);

	//сервисное сообщение
	if(other_data && other_data.s_msg){
		message.add(other_data.s_msg);
		fbs.ref("players/"+my_data.uid+"/s_msg").remove();
	}

	my_data.rating = (other_data?.rating) || 1400;
	my_data.games = (other_data?.games) || 0;
	my_data.name = (other_data?.name) || my_data.name;
	my_data.nick_tm = other_data?.nick_tm || 0;
	my_data.avatar_tm = other_data?.avatar_tm || 0;
	my_data.design_id = (other_data?.design_id) || 0;
	
	//правильно определяем аватарку
	const _pic_url=other_data?.pic_url;
	if (_pic_url && _pic_url.includes('mavatar'))
		my_data.pic_url=_pic_url
	else
		my_data.pic_url=my_data.orig_pic_url
	
	//загружаем мои данные в кэш
	await players_cache.update(my_data.uid,{pic_url:my_data.pic_url,rating:my_data.rating,name:my_data.name});
	await players_cache.update_avatar(my_data.uid);
	
	//устанавливаем фотки в попап
	objects.id_avatar.set_texture(players_cache.players[my_data.uid].texture);
	objects.id_name.set2(my_data.name,150);

	//загружаем дизайн
	pref.load_design(my_data.design_id);
	
	//проверяем блокировку
	my_data.blocked=await fbs_once('blocked/'+my_data.uid);
		
	//устанавлием имена
	objects.my_card_name.set2(my_data.name,150);
				
	//это путь к чату
	chat_path='states_chat';
	
	//устанавливаем рейтинг в попап
	objects.id_rating.text=objects.my_card_rating.text=my_data.rating;

	//обновляем почтовый ящик
	fbs.ref("inbox/"+my_data.uid).set({sender:"-",message:"-",tm:"-",data:{x1:0,y1:0,x2:0,y2:0,board_state:0}});

	//подписываемся на новые сообщения
	fbs.ref("inbox/"+my_data.uid).on('value', (snapshot) => { process_new_message(snapshot.val());});

	//обновляем данные в файербейс так как могли поменяться имя или фото
	fbs.ref('players/'+my_data.uid+'/name').set(my_data.name);
	fbs.ref('players/'+my_data.uid+'/pic_url').set(my_data.pic_url);
	fbs.ref('players/'+my_data.uid+'/rating').set(my_data.rating);
	fbs.ref('players/'+my_data.uid+'/games').set(my_data.games);
	fbs.ref('players/'+my_data.uid+'/auth_mode').set(my_data.auth_mode);
	fbs.ref('players/'+my_data.uid+'/session_start').set(firebase.database.ServerValue.TIMESTAMP);
	await fbs.ref('players/'+my_data.uid+'/tm').set(firebase.database.ServerValue.TIMESTAMP);
					
	if(!other_data?.first_log_tm)
		fbs.ref('players/'+my_data.uid+'/first_log_tm').set(firebase.database.ServerValue.TIMESTAMP);
		
	//устанавливаем мой статус в онлайн
	//set_state({state : 'o'});
	
	//сообщение для дубликатов
	fbs.ref("inbox/"+my_data.uid).set({message:"CLIEND_ID",tm:Date.now(),client_id});

	//отключение от игры и удаление не нужного
	fbs.ref("inbox/"+my_data.uid).onDisconnect().remove();
	
	//утвержденный лидер задачки (чтобы показывать кастомную карточку)
	quiz.accepted_leader=await fbs_once(quiz.path+'/accepted_leader');

	//keep-alive сервис
	setInterval(function()	{keep_alive()}, 40000);

	//ждем загрузки чата
	await Promise.race([
		chat.init(),
		new Promise(resolve=> setTimeout(() => {console.log('chat is not loaded!');resolve()}, 5000))
	]);

	//контроль за присутсвием
	var connected_control = fbs.ref(".info/connected");
	connected_control.on("value", (snap) => {
	  if (snap.val() === true) {
		connected = 1;
	  } else {
		connected = 0;
	  }
	});
	
	//сообщение от админа
	await check_admin_info();
		
	//убираем лупу и контейнер	
	anim2.add(objects.id_cont,{y:[objects.id_cont.sy, -200]}, false, 0.5,'easeInBack');	
	some_process.loup_anim = function(){};
	objects.id_loup.visible=false;
	
	//загружаем лобби с включенным ботом
	let room_to_go='states'+lobby.get_room_index_from_rating();
	//room_to_go='states5';
	lobby.activate(room_to_go,1);
}

function main_loop() {

	//обрабатываем минипроцессы
	for (let key in some_process)
		some_process[key]();	
	
	game_tick+=0.016666666;
	anim2.process();
	requestAnimationFrame(main_loop);
}