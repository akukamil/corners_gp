var M_WIDTH=800, M_HEIGHT=450;
var app, game_res,fbs, gdata={},  game, client_id, objects={}, state="",chat_path,my_role="", game_tick=0, made_moves=0, game_id=0, my_turn=0, connected = 1, LANG = 0;
var min_move_amount=0, h_state=0, game_platform="",git_src='', hidden_state_start = 0, room_name = 'states2';
g_board=[];
var players="",moving_chip=null, pending_player="",tm={}, some_process = {};
var my_data={opp_id : ''},opp_data={}, my_games_api = {};
const WIN = 1, DRAW = 0, LOSE = -1, NOSYNC = 2;

DESIGN_DATA={
	0:{name:'def',rating:0,games:0},
	1:{name:'ice',rating:1500,games:1000},
	2:{name:'grass',rating:1700,games:5000},
	3:{name:'wood',rating:1900,games:15000},
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
		
		
		this.bcg=new PIXI.Sprite(game_res.resources.mini_player_card.texture);
		this.bcg.width=210;
		this.bcg.height=100;
		this.bcg.interactive=true;
		this.bcg.buttonMode=true;
		this.bcg.pointerdown=function(){lobby.card_down(id)};
		
		this.table_rating_hl=new PIXI.Sprite(gres.table_rating_hl.texture);
		this.table_rating_hl.width=210;
		this.table_rating_hl.height=100;
		
		this.avatar=new PIXI.Sprite();
		this.avatar.x=18;
		this.avatar.y=17;
		this.avatar.width=this.avatar.height=62;
				
		this.name="";
		this.name_text=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 22,align: 'center'});
		this.name_text.anchor.set(0,0);
		this.name_text.x=90;
		this.name_text.y=20;
		this.name_text.tint=0xffffff;		

		this.rating=0;
		this.rating_text=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 30,align: 'center'});
		this.rating_text.tint=0xffff00;
		this.rating_text.anchor.set(0,0.5);
		this.rating_text.x=100;
		this.rating_text.y=65;		
		this.rating_text.tint=0xffff00;

		//аватар первого игрока
		this.avatar1=new PIXI.Sprite();
		this.avatar1.x=26;
		this.avatar1.y=17;
		this.avatar1.width=this.avatar1.height=61;

		//аватар второго игрока
		this.avatar2=new PIXI.Sprite();
		this.avatar2.x=125;
		this.avatar2.y=17;
		this.avatar2.width=this.avatar2.height=61;
		
		this.rating_text1=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.rating_text1.tint=0xffff00;
		this.rating_text1.anchor.set(0.5,0);
		this.rating_text1.x=55;
		this.rating_text1.y=60;

		this.rating_text2=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.rating_text2.tint=0xffff00;
		this.rating_text2.anchor.set(0.5,0);
		this.rating_text2.x=155;
		this.rating_text2.y=60;
		
		
		this.name1="";
		this.name2="";

		this.addChild(this.bcg,this.avatar, this.avatar1, this.avatar2,this.rating_text,this.table_rating_hl,this.rating_text1,this.rating_text2, this.name_text);
	}

}

class lb_player_card_class extends PIXI.Container{

	constructor(x,y,place) {
		super();

		this.bcg=new PIXI.Sprite(game_res.resources.lb_player_card_bcg.texture);
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
		this.avatar.y=10;
		this.avatar.width=this.avatar.height=48;


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
		this.hash=0;
		this.index=0;
		this.uid='';
	
		
		this.msg_bcg = new PIXI.NineSlicePlane(gres.msg_bcg.texture,90,50,45,50);
		this.msg_bcg.width=200;
		this.msg_bcg.height=70;	
		this.msg_bcg.x=100;	
		this.msg_bcg.alpha=0.95;

		this.name = new PIXI.BitmapText('Имя Фамил', {fontName: 'mfont',fontSize: gdata.chat_record_name_font_size});
		this.name.anchor.set(0.5,0.5);
		this.name.x=60;
		this.name.y=60;	
		this.name.tint=0xffff00;
		
		
		this.avatar = new PIXI.Sprite(PIXI.Texture.WHITE);
		this.avatar.width=40;
		this.avatar.height=40;
		this.avatar.x=40;
		this.avatar.y=10;
		this.avatar.interactive=true;
		const this_card=this;
		this.avatar.pointerdown=function(){chat.avatar_down(this_card)};		
		this.avatar.anchor.set(0,0)
				
		
		this.msg = new PIXI.BitmapText('Имя Фамил', {fontName: 'mfont',fontSize: gdata.chat_record_text_font_size,align: 'left'}); 
		this.msg.x=150;
		this.msg.y=35;
		this.msg.maxWidth=450;
		this.msg.anchor.set(0,0.5);
		this.msg.tint = 0x3B3838;
		
		this.msg_tm = new PIXI.BitmapText('28.11.22 12:31', {fontName: 'mfont',fontSize: gdata.chat_record_tm_font_size}); 
		this.msg_tm.x=200;		
		this.msg_tm.y=45;
		this.msg_tm.tint=0x767171;
		this.msg_tm.anchor.set(0,0);
		
		this.visible = false;
		this.addChild(this.msg_bcg,this.avatar,this.name,this.msg,this.msg_tm);
		
	}
	
	async update_avatar(uid, tar_sprite) {		
	
		//определяем pic_url
		await players_cache.update(uid);
		await players_cache.update_avatar(uid);
		tar_sprite.texture=players_cache.players[uid].texture;	
	}
	
	async set(msg_data) {
						
		//получаем pic_url из фб
		this.avatar.texture=PIXI.Texture.WHITE;
				
		await this.update_avatar(msg_data.uid, this.avatar);

		this.uid=msg_data.uid;
		this.tm = msg_data.tm;			
		this.hash = msg_data.hash;
		this.index = msg_data.index;
		
		
		this.name.set2(msg_data.name,110)
		this.msg.text=msg_data.msg;		
		
		const msg_bcg_width=Math.max(this.msg.width,100)+100;		
		
		//бэкграунд сообщения в зависимости от длины
		this.msg_bcg.width=msg_bcg_width				
				
		this.msg_tm.x=msg_bcg_width-15;
		this.msg_tm.text = new Date(msg_data.tm).toLocaleString();
		this.visible = true;	
		
		
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
		this.shadow=new PIXI.Sprite(gres.bcg_icon_shadow.texture);
		this.shadow.width=170;
		this.shadow.height=100;	
		
		this.bcg=new PIXI.Sprite(gres.design_0.texture);
		this.bcg.width=170;
		this.bcg.height=100;
		
		this.lock=new PIXI.Sprite(gres.lock.texture);
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
		this.bcg.texture=gres['design_'+id].texture;
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
		
		res_src=res_src||gres;
		
		if (!this.on||document.hidden)
			return;
		
		if (!res_src[res_name]?.data)
			return;
		
		res_src[res_name].sound.play();	
		
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
		
		if (objects.big_message_cont.ready===false) {
			sound.play('locked');
			return;			
		}

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
		
		if (objects.big_message_cont.ready===false)
			return;

		anim2.add(objects.big_message_cont,{y:[objects.big_message_cont.sy,450]}, false, 0.4,'easeInBack');		
		this.p_resolve("close");			
	}

}

board_func={

	checker_to_move:'',
	target_point:0,
	chips_tex:[0,0,0],
	moves:[],
	
	move_end_callback(){},

	update_board() {

		this.target_point=0;

		//сначала скрываем все шашки
		objects.checkers.forEach((c)=>{	c.visible=false});

		var ind=0;
		for (var x=0;x<8;x++) {
			for (var y=0;y<8;y++) {
				
				const chip_id=g_board[y][x];
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

	get_moves_path(move_data){

		var g_archive=[0,0,0,0,0,0,0,0,0,0,0];
		var move_archive=[[move_data.x1,move_data.y1]];


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

		left(	move_data,	JSON.parse(	JSON.stringify(g_board)),	JSON.parse(JSON.stringify(move_archive)));
		right(	move_data,	JSON.parse(	JSON.stringify(g_board)),	JSON.parse(JSON.stringify(move_archive)));
		up(		move_data,	JSON.parse(	JSON.stringify(g_board)),	JSON.parse(JSON.stringify(move_archive)));
		down(	move_data,	JSON.parse(	JSON.stringify(g_board)),	JSON.parse(JSON.stringify(move_archive)));

		return g_archive;
	},

	async start_gentle_move(move_data, moves) {

		moving_chip = this.get_checker_by_pos(move_data.x1, move_data.y1);		
							
		for (let i = 1 ; i < moves.length; i++) {			
			let tar_x = moves[i][0] * 50 + objects.board.x+20;
			let tar_y = moves[i][1] * 50 + objects.board.y+20;
			await anim2.add(moving_chip,{x:[moving_chip.x, tar_x], y: [moving_chip.y, tar_y]}, true, 0.16,'linear');
			sound.play('move');
		}		
		
		var [sx,sy]=moves[0];
		var [tx,ty]=moves[moves.length-1];

		//меняем старую и новую позицию шашки
		[g_board[ty][tx],g_board[sy][sx]]=[g_board[sy][sx],g_board[ty][tx]];

		//обновляем доску
		this.update_board();

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
			board_func.update_board();

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
		
		let b_str=''
		for (var y=0;y<8;y++){
			for (var x=0;x<8;x++){
				if (boardv[y][x]===1){
					b_str+=y;
					b_str+=x;					
				}			
			}
		}
		
		for (var y=0;y<8;y++){
			for (var x=0;x<8;x++){
				if (boardv[y][x]===2){
					b_str+=y;
					b_str+=x;					
				}				
			}
		}
		
		b_str+=move
		return b_str;	
		
	},
	
	str_to_brd(str){
		
		t_board =[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];

		for (i=0;i<48;i+=2){
			const y=str[i];
			const x=str[i+1];
			t_board[y][x]=1+(i>=24)*1;			
		}		

		return t_board;	
		
	},
	
	rotate_board(brd){	
		if (!brd) return;
		const new_board=JSON.parse(JSON.stringify(brd));
		for (x=0;x<8;x++){
			for(y=0;y<8;y++){				
				let figure=new_board[7-y][7-x];
				if(figure!==0){
					figure=3-figure;
				}				
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

		
		//вычиcляем рейтинг при проигрыше и устанавливаем его в базу он потом изменится
		let lose_rating = this.calc_new_rating(my_data.rating, LOSE);
		if (lose_rating >100 && lose_rating<9999)
			fbs.ref("players/"+my_data.uid+"/rating").set(lose_rating);
		
		//возможность чата
		this.chat_out=1;
		this.chat_in=1;
		objects.no_chat_button.alpha=1;
		objects.send_message_button.alpha=my_data.blocked?0.3:1;
		
		//устанавливаем локальный и удаленный статус
		set_state({state : 'p'});		
		
		//устанавливаем начальное расположение шашек
		g_board =[[2,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1]];
		board_func.update_board();
		
		
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
				
		if (my_data.blocked || !this.chat_out) return;		
		
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
		
	async forced_inbox_check(game_id,opp_name){
				
		let c_data=await fbs.ref('inbox/'+my_data.uid).once('value');
		c_data=c_data.val();
		fbs.ref('BAD_CASE2').push({name:my_data.name,opp_name,game_id,info:'forced_inbox_check',tm:Date.now(),inbox:c_data});
		
	},
		
	async stop (result) {
		
		let res_array = [
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
			['my_no_connection',LOSE , ['Потеряна связь!\nИспользуйте надежное интернет соединение.','Lost connection!\nUse a reliable internet connection']]
		];
		
		
		my_log.add({name:my_data.name,opp_name:opp_data.name,game_id,connected,tm:Date.now(),result:result,info:'game_stop'})	
		if (result==='opp_timeout'&&my_data.rating>1900){
			
			//fbs.ref('BAD_CASE2').push(my_log.log_arr);		
			//this.forced_inbox_check(game_id,opp_data.name);
			
		}
		
		
		
		clearTimeout(this.timer_id);		
		
		let result_row = res_array.find( p => p[0] === result);
		let result_str = result_row[0];
		let result_number = result_row[1];
		let result_info = result_row[2][LANG];				
		let old_rating = my_data.rating;
		my_data.rating = this.calc_new_rating (my_data.rating, result_number);
		fbs.ref('players/'+my_data.uid+'/rating').set(my_data.rating);
		fbs.ref('pdata/'+my_data.uid+'/PUB/rating').set(my_data.rating);
		
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
		fbs.ref("tables/"+game_id+'/board').set('fin');
		
		//если игра результативна то записываем дополнительные данные
		if (result_number === DRAW || result_number === LOSE || result_number === WIN) {
			
			//увеличиваем количество игр
			my_data.games++;
			fbs.ref("players/"+my_data.uid+"/games").set(my_data.games);		
			fbs.ref("pdata/"+my_data.uid+"/games").set(my_data.games);	

			//записываем результат в базу данных
			let duration = ~~((Date.now() - this.start_time)*0.001);
			fbs.ref("finishes/"+game_id).set({player1:objects.my_card_name.text,player2:objects.opp_card_name.text, res:result_number,fin_type:result_str,duration:duration,rating: [old_rating,my_data.rating],client_id:client_id, ts:firebase.database.ServerValue.TIMESTAMP});
			
			//контрольные концовки
			if (my_data.rating>2130 || opp_data.rating>2130) {
			fbs.ref("finishes2").push({uid:my_data.uid,player1:objects.my_card_name.text,player2:objects.opp_card_name.text, res:result_number,fin_type:result_str,duration:duration, rating: [old_rating,my_data.rating],client_id:client_id, ts:firebase.database.ServerValue.TIMESTAMP});	
			}
			
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

		board_func.update_board();
		

	},

	async stop(result) {


		let res_array = [
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

pref={
	
	board_texture:null,
	chips:[0,{texture:null},{texture:null}],	
	selected_design:0,
	design_loader:new PIXI.Loader(),
	cur_pic_url:'',
	avatar_changed:0,
	
	activate(){
		
		if(anim2.any_on()||objects.pref_cont.visible){
			sound.play('locked');
			return;			
		}
		
		sound.play('click');
		
		anim2.add(objects.pref_cont,{scale_x:[0,1]}, true, 0.2,'linear');
				
		//устанавливаем текущий фон
		this.select_design(objects.designs[my_data.design_id]);
		
		//определяем доступные скиниы
		for (let i in DESIGN_DATA){			
			const rating_req=DESIGN_DATA[i].rating;
			const games_req=DESIGN_DATA[i].games;	
			const av=my_data.rating>=rating_req||my_data.games>=games_req;
			objects.designs[i].lock.visible=!av;
		}
		
		anim2.add(objects.pref_info,{alpha:[0,1]}, false, 3,'easeBridge',false);	
		objects.pref_info.text=['Менять аватар и имя можно 1 раз в 30 дней!','You can change name and avatar once per month'][LANG];
		
		this.avatar_changed=0;
		objects.pref_cont.visible=true;
		objects.pref_avatar.texture=players_cache.players[my_data.uid].texture;
		
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
		objects.selected_design.x=design.x;
		objects.selected_design.y=design.y;	
	},
	
	sound_switch_down(){
		
		if(anim2.any_on()){
			sound.play('locked');
			return;			
		}
		
		if (this.sound_on){
			this.sound_on=0;
			objects.pref_info.text=['Звуки отключены','Sounds is off'][LANG];
			
		} else{
			this.sound_on=1;
			objects.pref_info.text=['Звуки включены','Sounds is on'][LANG];
		}
		anim2.add(objects.pref_info,{alpha:[0,1]}, false, 3,'easeBridge',false);		
		sound.on=this.sound_on;
		sound.play('click');
		const tar_x=sound.on?113:78;
		anim2.add(objects.sound_slider,{x:[objects.sound_slider.x,tar_x]}, true, 0.1,'linear');	
		
	},
	
	async change_name(){
		
		//провряем можно ли менять ник
		if(!this.check_time(my_data.nick_tm)) return;
									
		const name=await keyboard.read(15);
		if (name.length>1){
			my_data.name=name;

			objects.my_card_name.set2(my_data.name,110);
			set_state({});			
			objects.pref_info.text=['Имя изменено','Name has been changed'][LANG];
			anim2.add(objects.pref_info,{alpha:[0,1]}, false, 3,'easeBridge',false);		
			my_data.nick_tm=Date.now();			
			fbs.ref(`players/${my_data.uid}/nick_tm`).set(my_data.nick_tm);
			fbs.ref(`players/${my_data.uid}/name`).set(my_data.name);
			
			fbs.ref(`pdata/${my_data.uid}/PRV/nick_tm`).set(my_data.nick_tm);
			fbs.ref(`pdata/${my_data.uid}/PUB/name`).set(my_data.name);

		}else{
			
			objects.pref_info.text=['Какая-то ошибка','Unknown error'][LANG];
			anim2.add(objects.pref_info,{alpha:[0,1]}, false, 3,'easeBridge',false);
			
		}
		
	},
	
	async reset_avatar(){
		
		this.avatar_changed=1;
		this.cur_pic_url=my_data.orig_pic_url;
		objects.pref_avatar.texture=await players_cache.load_pic(my_data.uid,my_data.orig_pic_url);
		objects.pref_info.text=['Нажмите ОК чтобы сохранить','Press OK to confirm'][LANG];
		objects.pref_info.visible=true;
	},
	
	change_avatar(){
		
		if(!this.check_time(my_data.avatar_tm)) return;
		this.avatar_changed=1;
		this.cur_pic_url='mavatar'+irnd(10,999999);
		objects.pref_avatar.texture=PIXI.Texture.from(multiavatar(this.cur_pic_url));
		objects.pref_info.text=['Нажмите ОК чтобы сохранить','Press OK to confirm'][LANG];
		objects.pref_info.visible=true;
	},
	
	sound_switch(){
		
		if(anim2.any_on()){
			sound.play('locked');
			return;			
		}
		sound.switch();
		sound.play('click');
		const tar_x=sound.on?139:101; //38
		anim2.add(objects.pref_sound_slider,{x:[objects.pref_sound_slider.x,tar_x]}, true, 0.1,'linear');	
		
	},
		
	ok_button_down(){
		
		if(anim2.any_on()){
			sound.play('locked');
			return;			
		}
		
		sound.play('click');
		anim2.add(objects.pref_cont,{scale_x:[1,0]}, false, 0.2,'linear');	
		
		if (this.avatar_changed){
			
			players_cache.players[my_data.uid].texture=0;
			players_cache.players[my_data.uid].pic_url=this.cur_pic_url;
			
			
			fbs.ref(`players/${my_data.uid}/pic_url`).set(this.cur_pic_url);
			fbs.ref(`pdata/${my_data.uid}/PUB/pic_url`).set(this.cur_pic_url);
			
			my_data.avatar_tm=Date.now();
			fbs.ref(`players/${my_data.uid}/avatar_tm`).set(my_data.avatar_tm);
			fbs.ref(`pdata/${my_data.uid}/PRV/avatar_tm`).set(my_data.avatar_tm);
						
			players_cache.update_avatar(my_data.uid).then(()=>{
				const my_card=objects.mini_cards.find(card=>card.uid===my_data.uid);
				my_card.avatar.texture=players_cache.players[my_data.uid].texture;				
			})				
		}
		
		if(my_data.design_id!==this.selected_design.id){
			my_data.design_id=this.selected_design.id;
			fbs.ref('players/'+my_data.uid+'/design_id').set(my_data.design_id);
			fbs.ref('pdata/'+my_data.uid+'/PRV/design_id').set(my_data.design_id);
			this.load_design(my_data.design_id);
		}
		
	}
	
		
}

game = {

	opponent : '',
	selected_checker : 0,
	checker_is_moving : 0,
	state : 0,

	activate(opponent, role) {

		my_role = role;
		
		objects.desktop.texture=gres.desktop.texture;
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.5,'linear');	
		
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
		
		this.opponent = opponent;
		this.opponent.activate();
		
		//показываем и заполняем мою карточку	
		objects.my_card_name.set2(my_data.name,110);
		objects.my_card_rating.text=my_data.rating;
		objects.my_avatar.texture=players_cache.players[my_data.uid].texture;	
		anim2.add(objects.my_card_cont,{x:[-100, objects.my_card_cont.sx]}, true, 0.5,'linear');	
		
		objects.opp_card_name.set2(opp_data.name,110);
		objects.opp_card_rating.text=opp_data.rating;
		objects.opp_avatar.texture=players_cache.players[opp_data.uid].texture;	
		anim2.add(objects.opp_card_cont,{x:[800, objects.opp_card_cont.sx]}, true, 0.5,'linear');	
					
		sound.play('note');

		//это если перешли из бот игры
		this.selected_checker=0;
		objects.selected_frame.visible=false;

		//основные элементы игры
		objects.board.visible=true;
		objects.my_card_cont.visible=true;
		objects.opp_card_cont.visible=true;		
		
		objects.cur_move_text.visible=true;

		//обозначаем какой сейчас ход
		made_moves=0;
		objects.cur_move_text.text=['Ход: ','Move: '][LANG]+made_moves;

		//включаем взаимодейтсвие с доской
		objects.board.pointerdown = game.mouse_down_on_board.bind(game);
		

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
		var mx = e.data.global.x/app.stage.scale.x;
		var my = e.data.global.y/app.stage.scale.y;

		//координаты указателя на игровой доске
		var new_x=Math.floor(8*(mx-objects.board.x-20)/400);
		var new_y=Math.floor(8*(my-objects.board.y-20)/400);

		//если выбрана новая шашка
		if (!this.selected_checker)
		{
			//находим шашку по координатам
			this.selected_checker=board_func.get_checker_by_pos(new_x,new_y);

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

		if (this.selected_checker)
		{

			//если нажали на выделенную шашку то отменяем выделение
			if (new_x===this.selected_checker.ix && new_y===this.selected_checker.iy)
			{
				sound.play('move');
				this.selected_checker=0;
				objects.selected_frame.visible=false;
				return;
			}

			//формируем объект содержащий информацию о ходе
			let m_data={x1:this.selected_checker.ix,y1:this.selected_checker.iy,x2:new_x, y2:new_y};

			//пытыемся получить последовательность ходов
			let moves=board_func.get_moves_path(m_data);


			if (moves.length!==11)
			{
				//убираем выделение
				objects.selected_frame.visible=false;

				//отменяем выделение
				this.selected_checker=0;

				//отправляем ход сопернику
				game.process_my_move(m_data, moves);
			}
			else
			{
				message.add(["Так нельзя ходить","Invalid move"][LANG]);
			}
		}

	},

	async process_my_move(move_data, moves) {

		//делаем перемещение шашки
		this.checker_is_moving = 1;
		await board_func.start_gentle_move(move_data, moves);	
		this.checker_is_moving = 0;
		
		//начинаем процесс плавного перемещения шашки
		if (state === 'b') {					
			bot_game.make_move();
		}
		else
		{
			//переворачиваем данные о ходе так как оппоненту они должны попасть как ход шашками №2
			move_data.x1=7-move_data.x1;
			move_data.y1=7-move_data.y1;
			move_data.x2=7-move_data.x2;
			move_data.y2=7-move_data.y2;
			
			//отправляем ход сопернику
			my_log.add({name:my_data.name,opp_name:opp_data.name,move_data,game_id,made_moves,connected,tm:Date.now(),info:'process_my_move'})
			
			fbs.ref('inbox/'+opp_data.uid).set({sender:my_data.uid,message:'MOVE',tm:Date.now(),data:{...move_data, board_state:0}}).then(()=>{
				my_log.add({name:my_data.name,opp_name:opp_data.name,move_data,game_id,made_moves,connected,tm:Date.now(),info:'process_my_move_ok'})
			})


			//также фиксируем данные стола
			fbs.ref('tables/'+game_id+'/board').set({uid:my_data.uid,f_str:board_func.brd_to_str(g_board,made_moves),tm:Date.now()});
		
		}
		
		if (my_role === 'slave') {
			
			made_moves++;
			objects.cur_move_text.text=['Ход: ','Move: '][LANG]+made_moves;
			
			let result = board_func.get_board_state(g_board, made_moves);
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
			
		my_log.add({name:my_data.name,move_data,opp_name:opp_data.name,made_moves,my_turn,state:game.state,game_id,connected,tm:Date.now(),info:'rec_move'})			
			
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
		let moves = board_func.get_moves_path(move_data);

		//плавно перемещаем шашку
		this.checker_is_moving = 1;
		await board_func.start_gentle_move(move_data, moves);
		this.checker_is_moving = 0;		
		
		if (my_role === 'master') {
			made_moves++;
			objects.cur_move_text.text="Ход: "+made_moves;
				
			let result = board_func.get_board_state(g_board, made_moves);
			
			//бота нельзя блокировать
			if (result === 'opp_left_after_30' && this.opponent.name === 'bot')	result = '';
			
			if (result !== '') {
				this.stop(result);
			}			
		}
		
		my_log.add({name:my_data.name,move_data,opp_name:opp_data.name,made_moves,my_turn,state:game.state,game_id,connected,tm:Date.now(),info:'rec_move_ok'})			



	},
	
	async stop(result) {
				
		this.state = 'pending';
				
		await this.opponent.stop(result);
				
		objects.cur_move_text.visible=false;
		objects.board.visible=false;
		objects.opp_card_cont.visible=false;
		objects.my_card_cont.visible=false;
		objects.selected_frame.visible=false;
		objects.checkers.forEach((c)=> {c.visible=false});
		
		//рекламная пауза
		ad.show();
		await new Promise((resolve, reject) => setTimeout(resolve, 2000));
		
		this.state = 'off';
		//показыаем основное меню
		main_menu.activate();

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
	
	async activate(card_data){
		
		this.on=true;
		
		this.game_id=card_data.game_id;		
		
		objects.gw_back_button.visible=true;
		objects.my_card_cont.visible = true;	
		objects.opp_card_cont.visible = true;	
		objects.cur_move_text.visible=true;
		objects.board.visible=true;
		objects.board.interactive=false;
		objects.gw_master_chip.visible=true;
		objects.gw_slave_chip.visible=true;
		
		objects.desktop.texture=gres.desktop.texture;
			
		
		let main_data=await fbs.ref('tables/'+this.game_id).once('value');
		main_data=main_data.val();
		
		//определяем индексы карточек
		const master_ind=+(card_data.uid2===main_data.master)+1
		const slave_ind=3-master_ind;
				
		//аватарки		
		objects.my_avatar.texture=card_data['avatar'+master_ind].texture;
		objects.opp_avatar.texture=card_data['avatar'+slave_ind].texture;
		
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
				
		this.master_uid=main_data.master;
		this.slave_uid=main_data.slave;
		
		g_board=null;
		fbs.ref('tables/'+this.game_id+'/board').on('value',(snapshot) => {
			game_watching.new_move(snapshot.val());
		})
		
	},
		
	async new_move(board_data){

		if(!this.on) return;
		
		if(!board_data){
			g_board = [[2,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1]];
			board_func.update_board();
			return;
		}
		
		if(board_data==='fin'){			
			await big_message.show(['Эта игра завершена','This game is over'][LANG],')))');
			this.close();
			lobby.activate();
			return;
		} 
			
		//если предыдущее движение не завершено то завершаем его и ждем
		while (moving_chip&&!moving_chip.ready) {
			anim2.kill_anim(moving_chip);
			await new Promise(resolve => setTimeout(resolve, 100)); // wait for 1 second
		}
						
		const old_board=JSON.parse(JSON.stringify(g_board));
		const b_str = board_data.f_str.slice(0, 48);
		const move = +board_data.f_str.slice(48);
		const uid=board_data.uid;
		const new_board=board_func.str_to_brd(b_str);
		
		if (uid===this.slave_uid)
			board_func.rotate_board(new_board)		
		
		//если старой доски еще нет
		if (!g_board){			
			g_board=new_board;
			board_func.update_board();
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
		const moves=board_func.get_moves_path(move_data);		
		await board_func.start_gentle_move(move_data,moves);
		objects.cur_move_text.text=['Ход: ','Move: '][LANG]+move;
		
	},
	
	back_button_down(){
		
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
				
		objects.my_avatar.texture=objects.id_avatar.texture;
		objects.gw_back_button.visible=false;
		objects.board.visible=false;
		objects.board.interactive=true;
		objects.cur_move_text.visible=false;
		objects.my_card_cont.visible = false;	
		objects.opp_card_cont.visible = false;	
		objects.gw_master_chip.visible=false;
		objects.gw_slave_chip.visible=false;
		objects.checkers.forEach((c)=> {c.visible=false});
		fbs.ref('tables/'+this.game_id+'/board').off();
		this.on=false;

	}
	
}

keyboard={
	
	ru_keys:[[39,135.05,69,174.12,'1'],[79,135.05,109,174.12,'2'],[119,135.05,149,174.12,'3'],[159,135.05,189,174.12,'4'],[199,135.05,229,174.12,'5'],[239,135.05,269,174.12,'6'],[279,135.05,309,174.12,'7'],[319,135.05,349,174.12,'8'],[359,135.05,389,174.12,'9'],[399,135.05,429,174.12,'0'],[480,135.05,530,174.12,'<'],[59,183.88,89,222.95,'Й'],[99,183.88,129,222.95,'Ц'],[139,183.88,169,222.95,'У'],[179,183.88,209,222.95,'К'],[219,183.88,249,222.95,'Е'],[259,183.88,289,222.95,'Н'],[299,183.88,329,222.95,'Г'],[339,183.88,369,222.95,'Ш'],[379,183.88,409,222.95,'Щ'],[419,183.88,449,222.95,'З'],[459,183.88,489,222.95,'Х'],[499,183.88,529,222.95,'Ъ'],[79,232.72,109,271.79,'Ф'],[119,232.72,149,271.79,'Ы'],[159,232.72,189,271.79,'В'],[199,232.72,229,271.79,'А'],[239,232.72,269,271.79,'П'],[279,232.72,309,271.79,'Р'],[319,232.72,349,271.79,'О'],[359,232.72,389,271.79,'Л'],[399,232.72,429,271.79,'Д'],[439,232.72,469,271.79,'Ж'],[479,232.72,509,271.79,'Э'],[59,281.56,89,320.63,'!'],[99,281.56,129,320.63,'Я'],[139,281.56,169,320.63,'Ч'],[179,281.56,209,320.63,'С'],[219,281.56,249,320.63,'М'],[259,281.56,289,320.63,'И'],[299,281.56,329,320.63,'Т'],[339,281.56,369,320.63,'Ь'],[379,281.56,409,320.63,'Б'],[419,281.56,449,320.63,'Ю'],[500,281.56,530,320.63,')'],[440,135.05,470,174.12,'?'],[19,330.4,169,369.47,'ЗАКРЫТЬ'],[179,330.4,409,369.47,' '],[419,330.4,559,369.47,'ОТПРАВИТЬ'],[520,232.72,550,271.79,','],[460,281.56,490,320.63,'('],[19,232.72,69,271.79,'EN']],
	en_keys:[[41,135.05,71,174.12,'1'],[81,135.05,111,174.12,'2'],[121,135.05,151,174.12,'3'],[161,135.05,191,174.12,'4'],[201,135.05,231,174.12,'5'],[241,135.05,271,174.12,'6'],[281,135.05,311,174.12,'7'],[321,135.05,351,174.12,'8'],[361,135.05,391,174.12,'9'],[401,135.05,431,174.12,'0'],[482,135.05,532,174.12,'<'],[101,183.88,131,222.95,'Q'],[141,183.88,171,222.95,'W'],[181,183.88,211,222.95,'E'],[221,183.88,251,222.95,'R'],[261,183.88,291,222.95,'T'],[301,183.88,331,222.95,'Y'],[341,183.88,371,222.95,'U'],[381,183.88,411,222.95,'I'],[421,183.88,451,222.95,'O'],[461,183.88,491,222.95,'P'],[121,232.72,151,271.79,'A'],[161,232.72,191,271.79,'S'],[201,232.72,231,271.79,'D'],[241,232.72,271,271.79,'F'],[281,232.72,311,271.79,'G'],[321,232.72,351,271.79,'H'],[361,232.72,391,271.79,'J'],[401,232.72,431,271.79,'K'],[441,232.72,471,271.79,'L'],[462,281.56,492,320.63,'('],[61,281.56,91,320.63,'!'],[141,281.56,171,320.63,'Z'],[181,281.56,211,320.63,'X'],[221,281.56,251,320.63,'C'],[261,281.56,291,320.63,'V'],[301,281.56,331,320.63,'B'],[341,281.56,371,320.63,'N'],[381,281.56,411,320.63,'M'],[502,281.56,532,320.63,')'],[442,135.05,472,174.12,'?'],[21,330.4,171,369.47,'CLOSE'],[181,330.4,411,369.47,' '],[421,330.4,561,369.47,'SEND'],[522,232.72,552,271.79,','],[21,232.72,71,271.79,'RU']],
	
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
				
		anim2.add(objects.chat_keyboard_cont,{y:[-400, objects.chat_keyboard_cont.sy]}, true, 0.4,'easeOutBack');	


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
		objects.chat_keyboard_hl.width=x2-x;
		objects.chat_keyboard_hl.height=y2-y;
		
		objects.chat_keyboard_hl.x = x+objects.chat_keyboard.x;
		objects.chat_keyboard_hl.y = y+objects.chat_keyboard.y;	
		
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
			objects.chat_keyboard.texture=gres.eng_layout.texture;
		}else{			
			this.layout=this.ru_keys;
			objects.chat_keyboard.texture=gres.rus_layout.texture;
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
		anim2.add(objects.chat_keyboard_cont,{y:[objects.chat_keyboard_cont.y,450]}, false, 0.4,'easeInBack');		
		
	},
	
}

ad = {
		
		
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
	
	if (h_state === 1) {		
		
		//убираем из списка если прошло время с момента перехода в скрытое состояние		
		let cur_ts = Date.now();	
		let sec_passed = (cur_ts - hidden_state_start)/1000;		
		if ( sec_passed > 100 )	fbs.ref(room_name+"/"+my_data.uid).remove();
		return;		
	}


	fbs.ref("players/"+my_data.uid+"/tm").set(firebase.database.ServerValue.TIMESTAMP);
	fbs.ref("inbox/"+my_data.uid).onDisconnect().remove();
	fbs.ref(room_name+"/"+my_data.uid).onDisconnect().remove();

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

var kill_game = function() {
	
	firebase.app().delete();
	document.body.innerHTML = 'CLIENT TURN OFF';
}

var process_new_message = function(msg) {

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
	if (msg.message==="REJECT"  && pending_player === msg.sender) {
		lobby.rejected_invite();
	}

	//айди клиента для удаления дубликатов
	if (msg.message==="CLIEND_ID") 
		if (msg.client_id !== client_id)
			kill_game();


	//получение сообщение в состояни игры
	if (state==="p") {

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

			//получение сообщение с ходом игорка
			if (msg.message==='MOVE')
				game.receive_move(msg.data);
			
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
	
	async show(uid) {
		
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
		
		objects.req_avatar.texture=player.texture;


	},

	reject() {

		if (objects.req_cont.ready===false || objects.req_cont.visible===false)
			return;
		
		sound.play('close');


		anim2.add(objects.req_cont,{y:[objects.req_cont.sy, -260]}, false, 0.5,'easeInBack');

		fbs.ref("inbox/"+req_dialog._opp_data.uid).set({sender:my_data.uid,message:"REJECT",tm:Date.now()});
	},

	accept() {

		if (anim2.any_on()||objects.req_cont.visible===false || objects.big_message_cont.visible === true || game.state === 'pending') {
			sound.play('locked');
			return;			
		}



		
		//устанавливаем окончательные данные оппонента
		opp_data = req_dialog._opp_data;	
	
		anim2.add(objects.req_cont,{y:[objects.req_cont.sy, -260]}, false, 0.5,'easeInBack');


		//отправляем информацию о согласии играть с идентификатором игры
		game_id=~~(Math.random()*99999);
		fbs.ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"ACCEPT",tm:Date.now(),game_id:game_id});

		//заполняем карточку оппонента
		objects.opp_card_name.set2(opp_data.name,150);
		
		objects.opp_card_rating.text=objects.req_rating.text;
		objects.opp_avatar.texture=objects.req_avatar.texture;

		main_menu.close();
		lobby.close();
		game.activate(online_game, "slave");

	},

	hide() {

		//если диалог не открыт то ничего не делаем
		if (objects.req_cont.ready === false || objects.req_cont.visible === false)
			return;

		anim2.add(objects.req_cont,{y:[objects.req_cont.sy, -260]}, false, 0.5,'easeInBack');

	}

}

main_menu = {

	async activate() {
		
		
		//игровой титл
		anim2.add(objects.game_title,{y:[-100,objects.game_title.sy],alpha:[0,1]}, true, 0.75,'linear');	
		
		objects.desktop.texture=gres.desktop.texture;
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.5,'linear');	


		//some_process.main_menu=this.process;
		//кнопки
		await anim2.add(objects.main_buttons_cont,{y:[450,objects.main_buttons_cont.sy],alpha:[0,1]}, true, 0.75,'linear');	

	},

	async close() {
		
		//игровой титл
		anim2.add(objects.game_title,{y:[objects.game_title.y,-100],alpha:[1,0]}, false, 0.5,'linear');	
		
		//anim2.add(objects.desktop,{alpha:[1,0]}, false, 0.5,'linear');	

		//кнопки
		await anim2.add(objects.main_buttons_cont,{y:[objects.main_buttons_cont.y, 450],alpha:[1,0]}, false, 0.5,'linear');	
		


	},

	async play_button_down () {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		await this.close();
		lobby.activate();

	},

	async lb_button_down() {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		await this.close();
		lb.show();

	},

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
	
	activate() {	

		anim2.add(objects.chat_cont,{alpha:[0, 1]}, true, 0.1,'linear');
		objects.desktop.texture=gres.desktop.texture;
		objects.chat_enter_button.visible=!my_data.blocked && my_data.games>=this.games_to_chat;

	},
	
	init(){
		
		this.last_record_end = 0;
		objects.chat_msg_cont.y = objects.chat_msg_cont.sy;		
		objects.desktop.interactive=true;
		objects.desktop.pointermove=this.pointer_move.bind(this);
		objects.desktop.pointerdown=this.pointer_down.bind(this);
		objects.desktop.pointerup=this.pointer_up.bind(this);
		objects.desktop.pointerupoutside=this.pointer_up.bind(this);
		for(let rec of objects.chat_records) {
			rec.visible = false;			
			rec.msg_id = -1;	
			rec.tm=0;
		}
		
		
		objects.chat_rules.text='Правила чата!\n\n1. Будьте вежливы: Общайтесь с другими игроками с уважением. Избегайте угроз, грубых выражений, оскорблений, конфликтов.\n\n2. Отправлять сообщения в чат могут игроки сыгравшие более 200 онлайн партий.\n\n3. За нарушение правил игрок может попасть в черный список.'
		if(my_data.blocked) objects.chat_rules.text+='\n\n4. Вы не можете писать в чат, так как вы находитесь в черном списке';
		
		//загружаем чат
		fbs.ref(chat_path).orderByChild('tm').limitToLast(20).once('value', snapshot => {chat.chat_load(snapshot.val());});		
		
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
		let oldest = {tm:9671801786406 ,visible:true};		
		for(let rec of objects.chat_records)
			if (rec.visible===true && rec.tm < oldest.tm)
				oldest = rec;	
		return oldest;		
		
	},
		
	async chat_load(data) {
		
		if (data === null) return;
		
		//превращаем в массив
		data = Object.keys(data).map((key) => data[key]);
		
		//сортируем сообщения от старых к новым
		data.sort(function(a, b) {	return a.tm - b.tm;});
			
		//покаываем несколько последних сообщений
		for (let c of data)
			await this.chat_updated(c,true);	
		
		//подписываемся на новые сообщения
		fbs.ref(chat_path).on('child_changed', snapshot => {chat.chat_updated(snapshot.val());});
	},	
				
	async chat_updated(data, first_load) {		
	
		//console.log('receive message',data)
		if(data===undefined) return;
		
		//если это сообщение уже есть в чате
		if (objects.chat_records.find(obj => { return obj.hash === data.hash;}) !== undefined) return;
		
		
		//выбираем номер сообщения
		const new_rec=objects.chat_records[data.index||0]
		await new_rec.set(data);
		new_rec.y=this.last_record_end;
		
		this.last_record_end += gdata.chat_record_h;		

		if (!first_load)
			lobby.inst_message(data);
		
		//смещаем на одно сообщение (если чат не видим то без твина)
		if (objects.chat_cont.visible)
			await anim2.add(objects.chat_msg_cont,{y:[objects.chat_msg_cont.y,objects.chat_msg_cont.y-gdata.chat_record_h]},true, 0.05,'linear');		
		else
			objects.chat_msg_cont.y-=gdata.chat_record_h
		
	},
						
	avatar_down(player_data){
		
		if (this.moderation_mode){
			console.log(player_data.index,player_data.uid,player_data.name.text,player_data.msg.text);
			fbs_once('players/'+player_data.uid+'/games').then((data)=>{
				console.log('сыграно игр: ',data)
			})
		}
		
		if (this.block_next_click){			
			fbs.ref('blocked/'+player_data.uid).set(Date.now())
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
		
		objects.chat_msg_cont.y-=delta*gdata.chat_record_h*0.5;	
		const chat_bottom = this.last_record_end;
		const chat_top = this.last_record_end - objects.chat_records.filter(obj => obj.visible === true).length*gdata.chat_record_h;
		
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
		
		if (my_data.blocked){			
			message.add('Закрыто');
			return;
		}
		
		
		sound.play('click');
		
		//убираем метки старых сообщений
		const cur_dt=Date.now();
		this.recent_msg = this.recent_msg.filter(d =>cur_dt-d<60000);
				
		if (this.recent_msg.length>3){
			message.add(['Подождите 1 минуту','Wait 1 minute'][LANG])
			return;
		}		
		
		//добавляем отметку о сообщении
		this.recent_msg.push(Date.now());
		
		//пишем сообщение в чат и отправляем его		
		const msg = await keyboard.read(70);		
		if (msg) {			
			const hash=this.make_hash();
			const index=chat.get_oldest_index();
			fbs.ref(chat_path+'/'+index).set({uid:my_data.uid,name:my_data.name,msg, tm:firebase.database.ServerValue.TIMESTAMP,index, hash});
		}	
		
	},
		
	close() {
		
		anim2.add(objects.chat_cont,{alpha:[1, 0]}, false, 0.1,'linear');
		if (objects.chat_keyboard_cont.visible)
			keyboard.close();
	}
		
}

players_cache={
	
	players:{},
	
	async load_pic(uid,pic_url){
		
		//если это мультиаватар
		if(pic_url.includes('mavatar'))
			return PIXI.Texture.from(multiavatar(pic_url));
		
		const loader=new PIXI.Loader;
		loader.add(uid, pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});	
		await new Promise(resolve=> loader.load(resolve))		
		return loader.resources[uid].texture;
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
		if (player.pic_url) player.texture=await this.load_pic(uid, player.pic_url);	
		
	}	
}

lb={

	cards_pos: [[370,10],[380,70],[390,130],[380,190],[360,250],[330,310],[290,370]],
	last_update:0,

	show() {

		objects.desktop.texture=gres.lb_bcg.texture;
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.5,'linear');
		
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
		main_menu.activate();

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

lobby={
	
	state_tint :{},
	_opp_data : {},
	activated:false,
	rejected_invites:{},
	fb_cache:{},
	first_run:0,
	sw_header:{time:0,index:0,header_list:[]},
	
	activate() {
		
		//первый запуск лобби
		if (!this.activated){			
			//расставляем по соответствующим координатам
			
			for(let i=0;i<objects.mini_cards.length;i++) {

				const iy=i%4;
				objects.mini_cards[i].y=40+iy*83;
			
				let ix;
				if (i>15) {
					ix=~~((i-16)/4)
					objects.mini_cards[i].x=800+ix*196;
				}else{
					ix=~~((i)/4)
					objects.mini_cards[i].x=ix*196;
				}
			}		

			//запускаем чат
			chat.init();
			
			//создаем заголовки
			const room_desc=['КОМНАТА #','ROOM #'][LANG]+{'states1':1,'states2':2,'states3':3,'states4':4,'states5':5}[room_name];
			this.sw_header.header_list=[['ДОБРО ПОЖАЛОВАТЬ В ИГРУ УГОЛКИ ОНЛАЙН!','WELCOME!!!'][LANG],room_desc]
			objects.lobby_header.text=this.sw_header.header_list[0];
			this.sw_header.time=Date.now()+12000;
			this.activated=true;
		}
		
		objects.desktop.texture=gres.lobby_bcg.texture;
		anim2.add(objects.lobby_cont,{alpha:[0, 1]}, true, 0.1,'linear');
		
		objects.cards_cont.x=0;
		
		//отключаем все карточки
		for(let i=0;i<objects.mini_cards.length;i++)
			objects.mini_cards[i].visible=false;
		
		//процессинг
		some_process.lobby=function(){lobby.process()};

		//добавляем карточку ии
		this.add_card_ai();
		
		//подписываемся на изменения состояний пользователей
		fbs.ref(room_name) .on('value', (snapshot) => {lobby.players_list_updated(snapshot.val());});

	},

	players_list_updated(players) {

		//если мы в игре то не обновляем карточки
		if (state==='p'||state==='b')
			return;
		
		

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
		
		//console.table(single);
		
		//убираем не играющие состояние
		for (let uid in p_data)
			if (p_data[uid].state !== 'p')
				delete p_data[uid];		
		
		//дополняем полными ид оппонента
		for (let uid in p_data) {			
			let small_opp_id = p_data[uid].opp_id;			
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
		//console.log (`--------------------------------------------------`)
		for (let uid in p_data) {
			let opp_id = p_data[uid].opp_id;
			let name1 = p_data[uid].name;
			let rating = p_data[uid].rating;
			let hid = p_data[uid].hidden;
			
			if (p_data[opp_id] !== undefined) {
				
				if (uid === p_data[opp_id].opp_id && tables[uid] === undefined) {
					
					tables[uid] = opp_id;					
					//console.log(`${name1} (Hid:${hid}) (${rating}) vs ${p_data[opp_id].name} (Hid:${p_data[opp_id].hidden}) (${p_data[opp_id].rating}) `)	
					delete p_data[opp_id];				
				}
				
			} else 
			{				
				//console.log(`${name1} (${rating}) - одиночка `)					
			}			
		}
					
		
		
		//считаем и показываем количество онлайн игрокова
		let num = 0;
		for (let uid in players)
			if (players[uid].hidden===0)
				num++
					
		//считаем сколько одиночных игроков и сколько столов
		let num_of_single = Object.keys(single).length;
		let num_of_tables = Object.keys(tables).length;
		let num_of_cards = num_of_single + num_of_tables;
		
		//если карточек слишком много то убираем столы
		if (num_of_cards > objects.mini_cards.length) {
			let num_of_tables_cut = num_of_tables - (num_of_cards - objects.mini_cards.length);			
			
			let num_of_tables_to_cut = num_of_tables - num_of_tables_cut;
			
			//удаляем столы которые не помещаются
			let t_keys = Object.keys(tables);
			for (let i = 0 ; i < num_of_tables_to_cut ; i++) {
				delete tables[t_keys[i]];
			}
		}
		
		//убираем карточки пропавших игроков и обновляем карточки оставшихся
		for(let i=1;i<objects.mini_cards.length;i++) {			
			if (objects.mini_cards[i].visible === true && objects.mini_cards[i].type === 'single') {				
				let card_uid = objects.mini_cards[i].uid;				
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
		for(let i=1;i<objects.mini_cards.length;i++) {			
		
			if (objects.mini_cards[i].visible === true && objects.mini_cards[i].type === 'table') {
				
				let uid1 = objects.mini_cards[i].uid1;	
				let uid2 = objects.mini_cards[i].uid2;	
				
				let found = 0;
				
				for (let t in tables) {
					
					let t_uid1 = t;
					let t_uid2 = tables[t];				
					
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
			this.place_new_card({uid:uid, state:players[uid].state, name : players[uid].name,  rating : players[uid].rating});

		//размещаем новые столы сколько свободно
		for (let uid in tables) {			
			let n1=players[uid].name
			let n2=players[tables[uid]].name
			
			let r1= players[uid].rating
			let r2= players[tables[uid]].rating
			
			const game_id=players[uid].game_id;
			this.place_table({uid1:uid,uid2:tables[uid],name1: n1, name2: n2, rating1: r1, rating2: r2,game_id});
		}
		
	},

	add_card_ai() {
		
		const card=objects.mini_cards[0]
		
		//убираем элементы стола так как они не нужны
		card.rating_text1.visible = false;
		card.rating_text2.visible = false;
		card.avatar1.visible = false;
		card.avatar2.visible = false;
		card.table_rating_hl.visible = false;
		card.bcg.texture=gres.mini_player_card_ai.texture;

		card.visible=true;
		card.uid='bot';
		card.name=card.name_text.text=['Бот','Bot'][LANG];

		card.rating=1400;		
		card.rating_text.text = card.rating;
		card.avatar.texture=game_res.resources.pc_icon.texture;
		
		//также сразу включаем его в кэш
		if(!players_cache.players.bot){
			players_cache.players.bot={};
			players_cache.players.bot.name=['Бот','Bot'][LANG];
			players_cache.players.bot.rating=1400;
			players_cache.players.bot.texture=gres.pc_icon.texture;			
		}
	},
	
	get_state_texture(s) {
	
		switch(s) {

			case 'o':
				return gres.mini_player_card.texture;
			break;

			case 'b':
				return gres.mini_player_card_bot.texture;
			break;

			case 'p':
				return gres.mini_player_card.texture;
			break;
			
			case 'b':
				return gres.mini_player_card.texture;
			break;

		}
	},
	
	place_table(params={uid1:0,uid2:0,name1: 'X',name2:'X', rating1: 1400, rating2: 1400,game_id:0}) {
				
		for(let i=1;i<objects.mini_cards.length;i++) {
			
			const card=objects.mini_cards[i];

			//это если есть вакантная карточка
			if (!card.visible) {

				//устанавливаем цвет карточки в зависимости от состояния
				card.bcg.texture=this.get_state_texture(params.state);
				card.state=params.state;

				card.type = "table";
				
				
				card.bcg.texture = gres.mini_player_card_table.texture;
				
				//присваиваем карточке данные
				//card.uid=params.uid;
				card.uid1=params.uid1;
				card.uid2=params.uid2;
												
				//убираем элементы свободного стола
				card.rating_text.visible = false;
				card.avatar.visible = false;
				//card.avatar_frame.visible = false;
				card.name_text.visible = false;

				//Включаем элементы стола 
				card.table_rating_hl.visible=true;
				card.rating_text1.visible = true;
				card.rating_text2.visible = true;
				card.avatar1.visible = true;
				card.avatar2.visible = true;
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
		card.bcg.texture=this.get_state_texture(params.state);
		card.state=params.state;

		card.name_text.set2(params.name,105);
		card.rating=params.rating;
		card.rating_text.text=params.rating;
		card.visible=true;
	},

	place_new_card(params={uid:0, state: 'o', name:'X ', rating: rating}) {

		for(let i=1;i<objects.mini_cards.length;i++) {

			//ссылка на карточку
			const card=objects.mini_cards[i];

			//это если есть вакантная карточка
			if (!card.visible) {

				//устанавливаем цвет карточки в зависимости от состояния
				card.bcg.texture=this.get_state_texture(params.state);
				card.state=params.state;

				card.type = 'single';
				
				//присваиваем карточке данные
				card.uid=params.uid;

				//убираем элементы стола так как они не нужны
				card.rating_text1.visible = false;
				card.rating_text2.visible = false;
				card.avatar1.visible = false;
				card.avatar2.visible = false;
				card.table_rating_hl.visible=false;
				
				//включаем элементы свободного стола
				card.rating_text.visible = true;
				card.avatar.visible = true;
				//card.avatar_frame.visible = true;
				card.name_text.visible = true;

				card.name=params.name;
				card.name_text.set2(params.name,105);
				card.rating=params.rating;
				card.rating_text.text=params.rating;

				card.visible=true;

				//стираем старые данные
				card.avatar.texture=PIXI.Texture.EMPTY;

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
		params.tar_obj.texture=players_cache.players[params.uid].texture;			
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
		
		objects.td_avatar1.texture = card.avatar1.texture;
		objects.td_avatar2.texture = card.avatar2.texture;
		
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
		objects.invite_button.texture=game_res.resources.invite_button.texture;
	
		anim2.add(objects.invite_cont,{x:[800, objects.invite_cont.sx]}, true, 0.15,'linear');
		
		const card=objects.mini_cards[card_id];
		
		//копируем предварительные данные
		lobby._opp_data = {uid:card.uid,name:card.name,rating:card.rating};
			
		
		this.show_feedbacks(lobby._opp_data.uid);
		
		objects.invite_button_title.text=['ПРИГЛАСИТЬ','SEND INVITE'][LANG];

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
		objects.invite_button.visible=objects.invite_button_title.visible=invite_available;

		//заполняем карточу приглашения данными
		objects.invite_avatar.texture=card.avatar.texture;
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
		objects.invite_button.texture=game_res.resources.invite_button.texture;
	
		anim2.add(objects.invite_cont,{x:[800, objects.invite_cont.sx]}, true, 0.15,'linear');
		
		let player_data={uid};
		//await this.update_players_cache_data(uid);
					
		//копируем предварительные данные
		lobby._opp_data = {uid,name:players_cache.players[uid].name,rating:players_cache.players[uid].rating};
											
											
		//фидбэки												
		this.show_feedbacks(lobby._opp_data.uid);
		
		//кнопка удаления комментариев
		objects.fb_delete_button.visible=false;
		
		objects.invite_button_title.text=['ПРИГЛАСИТЬ','SEND INVITE'][LANG];

		let invite_available = 	lobby._opp_data.uid !== my_data.uid;
		
		//если мы в списке игроков которые нас недавно отврегли
		if (this.rejected_invites[lobby._opp_data.uid] && Date.now()-this.rejected_invites[lobby._opp_data.uid]<60000) invite_available=false;

		//показыаем кнопку приглашения только если это допустимо
		objects.invite_button.visible=objects.invite_button_title.visible=invite_available;

		//заполняем карточу приглашения данными
		objects.invite_avatar.texture=players_cache.players[uid].texture;
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

		//плавно все убираем
		anim2.add(objects.lobby_cont,{alpha:[1, 0]}, false, 0.1,'linear');

		//больше ни ждем ответ ни от кого
		pending_player="";
		
		//отписываемся от изменений состояний пользователей
		fbs.ref(room_name).off();

	},
	
	async inst_message(data){
		
		//когда ничего не видно не принимаем сообщения
		if(!objects.lobby_cont.visible) return;		

		await players_cache.update(data.uid);
		await players_cache.update_avatar(data.uid);		
		
		sound.play('inst_msg');		
		anim2.add(objects.inst_msg_cont,{alpha:[0, 1]},true,0.4,'linear',false);		
		objects.inst_msg_avatar.texture=players_cache.players[data.uid].texture||PIXI.Texture.WHITE;
		objects.inst_msg_text.set2(data.msg,300);
		objects.inst_msg_cont.tm=Date.now();
	},
	
	process(){
		
		const tm=Date.now();
		if (objects.inst_msg_cont.visible&&objects.inst_msg_cont.ready)
			if (tm>objects.inst_msg_cont.tm+7000)
				anim2.add(objects.inst_msg_cont,{alpha:[1, 0]},false,0.4,'linear');

		if (tm>this.sw_header.time){
			this.switch_header();			
			this.sw_header.time=tm+12000;
			this.sw_header.index=(this.sw_header.index+1)%this.sw_header.header_list.length;
			this.switch_header();
		}

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
	
	async switch_header(){
		
		await anim2.add(objects.lobby_header,{y:[objects.lobby_header.sy, -60],alpha:[1,0]},false,1,'linear',false);	
		objects.lobby_header.text=this.sw_header.header_list[this.sw_header.index];		
		anim2.add(objects.lobby_header,{y:[-60,objects.lobby_header.sy],alpha:[0,1]},true,1,'linear',false);	

		
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


		if (!objects.invite_cont.ready||!objects.invite_cont.visible)
			return;

		if (anim2.any_on() === true) {
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
		}
		else
		{
			sound.play('click');
			objects.invite_button_title.text=['Ждите ответ..','Waiting...'][LANG];
			fbs.ref('inbox/'+lobby._opp_data.uid).set({sender:my_data.uid,message:"INV",tm:Date.now()});
			pending_player=lobby._opp_data.uid;

		}

	},

	rejected_invite() {

		this.rejected_invites[pending_player]=Date.now();
		pending_player="";
		lobby._opp_data={};
		this.close_invite_dialog();
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
		
		//обновляем стол
		fbs.ref('tables/'+game_id+'/master').set(my_data.uid);
		fbs.ref('tables/'+game_id+'/slave').set(opp_data.uid);
		
	},

	goto_chat_down(){
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};
		sound.play('click');
		this.close();
		chat.activate();
		
	},

	swipe_down(dir){
		
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		const cur_x=objects.cards_cont.x;
		const new_x=cur_x-dir*800;
		
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
		main_menu.activate();

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
		objects.sent_sticker_area.texture=game_res.resources['sticker_texture_'+id].texture;
		
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

		objects.rec_sticker_area.texture=game_res.resources['sticker_texture_'+id].texture;
	
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
		
	load_script : function(src) {
	  return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.onload = resolve
		script.onerror = reject
		script.src = src
		document.head.appendChild(script)
	  })
	},
		
	get_random_name : function(e_str) {
		
		let rnd_names = ['Gamma','Жираф','Зебра','Тигр','Ослик','Мамонт','Волк','Лиса','Мышь','Сова','Hot','Енот','Кролик','Бизон','Super','ZigZag','Magik','Alpha','Beta','Foxy','Fazer','King','Kid','Rock'];
		let chars = '+0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		if (e_str !== undefined) {
			
			let e_num1 = chars.indexOf(e_str[0]) + chars.indexOf(e_str[1]) + chars.indexOf(e_str[2]) +	chars.indexOf(e_str[3]);
			e_num1 = Math.abs(e_num1) % (rnd_names.length - 1);					
			let e_num2 = chars.indexOf(e_str[4]).toString()  + chars.indexOf(e_str[5]).toString()  + chars.indexOf(e_str[6]).toString() ;	
			e_num2 = e_num2.substring(0, 3);
			return rnd_names[e_num1] + e_num2;					
			
		} else {

			let rnd_num = irnd(0, rnd_names.length - 1);
			let rand_uid = irnd(0, 999999)+ 100;
			let name_postfix = rand_uid.toString().substring(0, 3);
			let name =	rnd_names[rnd_num] + name_postfix;				
			return name;
		}							

	},		
	
	init : async function() {	
			
		if (game_platform === 'YANDEX') {
			
			
			try {await this.load_script('https://yandex.ru/games/sdk/v2')} catch (e) {alert(e)};									
					
			let _player;
			
			try {
				window.ysdk = await YaGames.init({});			
				_player = await window.ysdk.getPlayer();
			} catch (e) { alert(e)};
			
			my_data.name 	= _player.getName();
			my_data.uid 	= _player.getUniqueID().replace(/\//g, "Z");
			my_data.orig_pic_url = _player.getPhoto('medium');						
			my_data.name = my_data.name || this.get_random_name(my_data.uid);
			if (my_data.orig_pic_url === 'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/0/islands-retina-medium')
				my_data.orig_pic_url = 'mavatar'+my_data.uid;	
			return;
		}
		
		if (game_platform === 'VK') {
			
			game_platform = 'VK';
			
			try {await this.load_script('https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js')} catch (e) {alert(e)};
			
			let _player;
			
			try {
				await vkBridge.send('VKWebAppInit');
				_player = await vkBridge.send('VKWebAppGetUserInfo');				
			} catch (e) {alert(e)};

			
			my_data.name 	= _player.first_name + ' ' + _player.last_name;
			my_data.uid 	= "vk"+_player.id;
			my_data.orig_pic_url = _player.photo_100;
			
			return;
			
		}
		
	}
	
}

auth2 = {
	
	my_games_user_profile_resolve : {},
	my_games_login_status_resolve : {},
	my_games_register_user_resolve : {},
	ok_resolve : {},
	
	get_mygames_user_data () {
		
		return new Promise(function(resolve, reject){			
			auth2.my_games_user_profile_resolve = resolve;
			my_games_api.userProfile();	  
		});	
		
	},
	
	get_mygames_login_status() {
		
		return new Promise(function(resolve, reject){			
			auth2.my_games_login_status_resolve = resolve;
			my_games_api.getLoginStatus();	  
		});	
		
	},
	
	register_mygames_user () {
		
		return new Promise(function(resolve, reject){			
			auth2.my_games_register_user_resolve = resolve;
			my_games_api.registerUser();	  
		});	
		
	},
	
	load_script(src) {
	  return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.onload = resolve
		script.onerror = reject
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
			
			if (my_data.orig_pic_url === 'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/0/islands-retina-medium')
				my_data.orig_pic_url = 'mavatar'+my_data.uid;	
			
			if (my_data.name === '')
				my_data.name = this.get_random_name(my_data.uid);
			
			//если английский яндекс до добавляем к имени страну
			my_data.name = my_data.name;			


			
			return;
		}
		
		if (game_platform === 'VK') {
			
			try {await this.load_script('https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js')} catch (e) {alert(e)};
			
			let _player;
			
			try {
				await vkBridge.send('VKWebAppInit');
				_player = await vkBridge.send('VKWebAppGetUserInfo');				
			} catch (e) {alert(e)};
			
			my_data.name 	= _player.first_name + ' ' + _player.last_name;
			my_data.uid 	= "vk"+_player.id;
			my_data.orig_pic_url = _player.photo_100;
			
			return;			
		}
		
		if (game_platform === 'GOOGLE_PLAY') {	
		
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GP_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'https://api.dicebear.com/7.x/adventurer/svg?seed='+my_data.uid;		
			return;
		}
		
		if (game_platform === 'MY_GAMES') {	

			game_platform = 'MY_GAMES';
			
			try {await this.load_script('//store.my.games/app/19671/static/mailru.core.js')} catch (e) {alert(e)};													
			try {my_games_api = await window.iframeApi({
				appid: 19671,
				getLoginStatusCallback: function(status) {auth2.my_games_login_status_resolve(status)},
				userInfoCallback: function(info) {},
				userProfileCallback: function(profile) {auth2.my_games_user_profile_resolve(profile)},
				registerUserCallback: function(info) {auth2.my_games_register_user_resolve(info)},
				paymentFrameUrlCallback: function(url) {},
				getAuthTokenCallback: function(token) {},
				paymentReceivedCallback: function(data) {},
				paymentWindowClosedCallback: function() {},
				userConfirmCallback: function() {},
				paymentFrameItem: function(object) {},
				adsCallback: function(context) {console.log(context)}
			})} catch (e) {alert(e)};	
					
					
			let res = await this.get_mygames_login_status();
			console.log(res);
			if (res.loginStatus ===0) {
				my_games_api.authUser();				
				return;				
			}
			
			let player_data;
			if (res.loginStatus ===1)
				await this.register_mygames_user();	
				
			player_data = await this.get_mygames_user_data();			

	
			console.log(player_data);
			
			my_data.uid = 'MG_' + player_data.uid;
			my_data.name = player_data.nick;
			my_data.orig_pic_url = player_data.avatar;	
			
		}
		
		if (game_platform === 'DEBUG') {		

			my_data.name = my_data.uid = 'debug' + prompt('Отладка. Введите ID', 100);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;			
			return;
		}		

		
		if (game_platform === 'UNKNOWN') {
			
			//если не нашли платформу
			alert('Неизвестная платформа. Кто Вы?')
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('LS_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;	
		}
	}
	
}

function resize() {
    const vpw = window.innerWidth;  // Width of the viewport
    const vph = window.innerHeight; // Height of the viewport
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

	let small_opp_id="";
	if (opp_data.uid!==undefined)
		small_opp_id=opp_data.uid.substring(0,10);

	fbs.ref(room_name+"/"+my_data.uid).set({state:state, name:my_data.name, rating : my_data.rating, hidden:h_state, opp_id : small_opp_id, game_id});

}

function vis_change() {

	if (document.hidden === true) {
		hidden_state_start = Date.now();			
		sound.on=0;
	} else {
		sound.on=pref.sound_on;	
	}		
	set_state({hidden : document.hidden});
		
}

language_dialog = {
	
	p_resolve : {},
	
	show () {
				
		return new Promise(function(resolve, reject){


			document.body.innerHTML='<style>		html,		body {		margin: 0;		padding: 0;		height: 100%;	}		body {		display: flex;		align-items: center;		justify-content: center;		background-color: rgba(24,24,64,1);		flex-direction: column	}		.two_buttons_area {	  width: 70%;	  height: 50%;	  margin: 20px 20px 0px 20px;	  display: flex;	  flex-direction: row;	}		.button {		margin: 5px 5px 5px 5px;		width: 50%;		height: 100%;		color:white;		display: block;		background-color: rgba(44,55,100,1);		font-size: 10vw;		padding: 0px;	}  	#m_progress {	  background: rgba(11,255,255,0.1);	  justify-content: flex-start;	  border-radius: 100px;	  align-items: center;	  position: relative;	  padding: 0 5px;	  display: none;	  height: 50px;	  width: 70%;	}	#m_bar {	  box-shadow: 0 10px 40px -10px #fff;	  border-radius: 100px;	  background: #fff;	  height: 70%;	  width: 0%;	}	</style><div id ="two_buttons" class="two_buttons_area">	<button class="button" id ="but_ref1" onclick="language_dialog.p_resolve(0)">RUS</button>	<button class="button" id ="but_ref2"  onclick="language_dialog.p_resolve(1)">ENG</button></div><div id="m_progress">  <div id="m_bar"></div></div>';
			
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

async function init_game_env(lang) {
				
	
	await define_platform_and_language();
	console.log(game_platform, LANG);
						
	//отображаем шкалу загрузки
	document.body.innerHTML='<style>html,body {margin: 0;padding: 0;height: 100%;	}body {display: flex;align-items: center;justify-content: center;background-color: rgba(41,41,41,1);flex-direction: column	}#m_progress {	  background: #1a1a1a;	  justify-content: flex-start;	  border-radius: 5px;	  align-items: center;	  position: relative;	  padding: 0 5px;	  display: none;	  height: 50px;	  width: 70%;	}	#m_bar {	  box-shadow: 0 1px 0 rgba(255, 255, 255, .5) inset;	  border-radius: 5px;	  background: rgb(119, 119, 119);	  height: 70%;	  width: 0%;	}	</style></div><div id="m_progress">  <div id="m_bar"></div></div>';
			
	//подгружаем библиотеку аватаров
	await auth2.load_script('multiavatar.min.js');
			
	await load_resources();
	
	if ((game_platform === 'YANDEX' || game_platform === 'VK') && LANG === 0)
		await auth1.init();
	else
		await auth2.init();
	

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

	app = new PIXI.Application({width:M_WIDTH, height:M_HEIGHT,antialias:false,backgroundColor : 0x202020});
	const c=document.body.appendChild(app.view);
	c.style['boxShadow'] = '0 0 15px #000000';
	
	//доп функция для текста битмап
	PIXI.BitmapText.prototype.set2=function(text,w){		
		const t=this.text=text;
		for (i=t.length;i>=0;i--){
			this.text=t.substring(0,i)
			if (this.width<w) return;
		}	
	}

	//события изменения окна
	resize();
	window.addEventListener("resize", resize);
	
	//идентификатор клиента
	client_id = irnd(10,999999);

    //создаем спрайты и массивы спрайтов и запускаем первую часть кода
    for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing: ' + obj_name)

        switch (obj_class) {
        case "sprite":
            objects[obj_name] = new PIXI.Sprite(game_res.resources[obj_name].texture);
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

	//запускаем главный цикл
	main_loop();
	
	//анимация лупы
	some_process.loup_anim=function() {
		objects.id_loup.x=20*Math.sin(game_tick*8)+90;
		objects.id_loup.y=20*Math.cos(game_tick*8)+150;
	}

	//это разные события
	document.addEventListener("visibilitychange", vis_change);
	
	//событие ролика мыши в карточном меню и нажатие кнопки
	window.addEventListener("wheel", (event) => {chat.wheel_event(Math.sign(event.deltaY))});	
	window.addEventListener('keydown',function(event){keyboard.keydown(event.key)});
	
	//загружаем остальные данные из файербейса
	let _other_data = await fbs.ref('players/' + my_data.uid).once('value');
	let other_data = _other_data.val();

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
	if (other_data?.pic_url && other_data.pic_url.includes('mavatar'))
		my_data.pic_url=other_data.pic_url
	else
		my_data.pic_url=my_data.orig_pic_url
	
	//загружаем мои данные в кэш
	await players_cache.update(my_data.uid,{pic_url:my_data.pic_url,rating:my_data.rating,name:my_data.name});
	await players_cache.update_avatar(my_data.uid);
	
	//устанавливаем фотки в попап
	objects.id_avatar.texture=players_cache.players[my_data.uid].texture;
	objects.id_name.set2(my_data.name,150);
		
	//загружаем дизайн
	pref.load_design(my_data.design_id);
	
	//проверяем блокировку
	my_data.blocked=await fbs_once('blocked/'+my_data.uid);
		
	//устанавлием имена
	objects.id_name.set2(my_data.name,150);
	objects.my_card_name.set2(my_data.name,150);
			
	//номер комнаты в зависимости от рейтинга игрока
	const rooms_bins=[0,1366,1437,1663,9999];
	for (let i=1;i<rooms_bins.length;i++){
		const f=rooms_bins[i-1];
		const t=rooms_bins[i];		
		if (my_data.rating>f&&my_data.rating<=t){
			room_name='states'+i;
			break;
		}
	}
	
	
	//room_name= 'states5';	
	//это путь к чату
	chat_path='states_chat';
	
	//устанавливаем рейтинг в попап
	objects.id_rating.text=objects.my_card_rating.text=my_data.rating;

	//убираем лупу
	some_process.loup_anim = function(){};
	objects.id_loup.visible=false;

	//обновляем почтовый ящик
	fbs.ref("inbox/"+my_data.uid).set({sender:"-",message:"-",tm:"-",data:{x1:0,y1:0,x2:0,y2:0,board_state:0}});

	//подписываемся на новые сообщения
	fbs.ref("inbox/"+my_data.uid).on('value', (snapshot) => { process_new_message(snapshot.val());});

	//обновляем данные в файербейс так как могли поменяться имя или фото
	fbs.ref("players/"+my_data.uid+"/name").set(my_data.name);
	fbs.ref("players/"+my_data.uid+"/pic_url").set(my_data.pic_url);
	fbs.ref("players/"+my_data.uid+"/rating").set(my_data.rating);
	fbs.ref("players/"+my_data.uid+"/games").set(my_data.games);
	fbs.ref("players/"+my_data.uid+"/tm").set(firebase.database.ServerValue.TIMESTAMP);
		
		
	//новое 	
	fbs.ref('pdata/'+my_data.uid+'/PUB/name').set(my_data.name);
	fbs.ref('pdata/'+my_data.uid+'/PUB/pic_url').set(my_data.pic_url);
	fbs.ref('pdata/'+my_data.uid+'/PUB/rating').set(my_data.rating);
	fbs.ref('pdata/'+my_data.uid+'/PRV/games').set(my_data.games);
	fbs.ref('pdata/'+my_data.uid+'/PRV/tm').set(firebase.database.ServerValue.TIMESTAMP);
	
	
	//устанавливаем мой статус в онлайн
	set_state({state : 'o'});
	
	//сообщение для дубликатов
	fbs.ref("inbox/"+my_data.uid).set({message:"CLIEND_ID",tm:Date.now(),client_id:client_id});

	//отключение от игры и удаление не нужного
	fbs.ref("inbox/"+my_data.uid).onDisconnect().remove();
	fbs.ref(room_name+"/"+my_data.uid).onDisconnect().remove();


	//keep-alive сервис
	setInterval(function()	{keep_alive()}, 40000);

	anim2.add(objects.id_cont,{y:[objects.id_cont.sy, -200]}, false, 0.5,'easeInBack');
	

	//контроль за присутсвием
	var connected_control = fbs.ref(".info/connected");
	connected_control.on("value", (snap) => {
	  if (snap.val() === true) {
		connected = 1;
	  } else {
		connected = 0;
	  }
	});
	

	//устанавливаем начальный вид шашек
	board_func.chk_type='quad';

	//показыаем основное меню
	main_menu.activate();
	


}

async function load_resources() {

	document.getElementById("m_progress").style.display = 'flex';

	git_src="https://akukamil.github.io/corners_gp/"
	git_src=""

	//подпапка с ресурсами
	let lang_pack = ['RUS','ENG'][LANG];
	
	game_res=new PIXI.Loader();
	game_res.add("m2_font", git_src+"fonts/Bahnschrift/font.fnt");

	game_res.add('receive_move',git_src+'sounds/receive_move.mp3');
	game_res.add('note',git_src+'sounds/note.mp3');
	game_res.add('receive_sticker',git_src+'sounds/receive_sticker.mp3');
	game_res.add('message',git_src+'sounds/message.mp3');
	game_res.add('lose',git_src+'sounds/lose.mp3');
	game_res.add('win',git_src+'sounds/win.mp3');
	game_res.add('click',git_src+'sounds/click.mp3');
	game_res.add('close',git_src+'sounds/close.mp3');
	game_res.add('move',git_src+'sounds/move.mp3');
	game_res.add('locked',git_src+'sounds/locked.mp3');
	game_res.add('clock',git_src+'sounds/clock.mp3');
	game_res.add('keypress',git_src+'sounds/keypress.mp3');
	game_res.add('online_message',git_src+'sounds/online_message.mp3');
	game_res.add('inst_msg',git_src+'sounds/inst_msg.mp3');

    //добавляем из листа загрузки
    for (var i = 0; i < load_list.length; i++)
        if (load_list[i].class === "sprite" || load_list[i].class === "image" )
            game_res.add(load_list[i].name, git_src+'res/'+lang_pack+'/'+load_list[i].name+"."+load_list[i].image_format);		

	//добавляем текстуры стикеров
	for (var i=0;i<16;i++)
		game_res.add("sticker_texture_"+i, git_src+"stickers/"+i+".png");

	//прогресс
	game_res.onProgress.add(function(loader, resource) {
		document.getElementById("m_bar").style.width =  Math.round(loader.progress)+"%";
	});
	
	
	await new Promise((resolve, reject)=> game_res.load(resolve))
	
	//убираем элементы загрузки
	document.getElementById("m_progress").outerHTML = "";	
	game_res.onProgress=null;

	//короткое обращение к ресурсам
	gres=game_res.resources;

}

function main_loop() {

	//обрабатываем минипроцессы
	for (let key in some_process)
		some_process[key]();	
	
	game_tick+=0.016666666;
	anim2.process();
	requestAnimationFrame(main_loop);
}