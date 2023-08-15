var M_WIDTH=800, M_HEIGHT=450;
var app, game_res,fbs, gdata={},  game, client_id, objects={}, state="",chat_path,my_role="", game_tick=0, my_checkers=1, made_moves=0, game_id=0, my_turn=0, connected = 1, LANG = 0;
var min_move_amount=0, h_state=0, game_platform="", hidden_state_start = 0, room_name = 'states2';
g_board=[];
var players="",moving_chip=null, pending_player="",tm={}, some_process = {};
var my_data={opp_id : ''},opp_data={}, my_games_api = {};
const WIN = 1, DRAW = 0, LOSE = -1, NOSYNC = 2;

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
		this.name_text.x=95;
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
	
		
		this.msg_bcg = new PIXI.Sprite(gres.msg_bcg_short.texture);
		this.msg_bcg.width=gdata.chat_record_w;
		this.msg_bcg.height=gdata.chat_record_h;


		this.name = new PIXI.BitmapText('Имя Фамил', {fontName: 'mfont',fontSize: gdata.chat_record_name_font_size});
		this.name.anchor.set(0.5,0.5);
		this.name.x=gdata.chat_record_name_x;
		this.name.y=gdata.chat_record_name_y;	
		this.name.tint=gdata.chat_record_name_tint;
		
		
		this.avatar = new PIXI.Sprite(PIXI.Texture.WHITE);
		this.avatar.width=gdata.chat_record_avatar_w;
		this.avatar.height=gdata.chat_record_avatar_h;
		this.avatar.x=gdata.chat_record_avatar_sx;
		this.avatar.y=gdata.chat_record_avatar_sy;
		this.avatar.interactive=true;
		const this_card=this;
		this.avatar.pointerdown=function(){chat.avatar_down(this_card)};		
		this.avatar.anchor.set(0,0)
				
		
		this.msg = new PIXI.BitmapText('Имя Фамил', {fontName: 'mfont',fontSize: gdata.chat_record_text_font_size,align: 'left'}); 
		this.msg.x=gdata.chat_record_text_x;
		this.msg.y=gdata.chat_record_text_y;
		this.msg.maxWidth=gdata.chat_record_text_max_w;
		this.msg.anchor.set(0,0.5);
		this.msg.tint = gdata.chat_record_text_col;
		
		this.msg_tm = new PIXI.BitmapText('28.11.22 12:31', {fontName: 'mfont',fontSize: gdata.chat_record_tm_font_size}); 
		this.msg_tm.x=gdata.chat_record_tm_x;		
		this.msg_tm.y=gdata.chat_record_tm_y;

		this.msg_tm.tint=gdata.chat_record_tm_col;
		this.msg_tm.anchor.set(0,0);
		
		this.visible = false;
		this.addChild(this.msg_bcg,this.avatar,this.name,this.msg,this.msg_tm);
		
	}
	
	async update_avatar(uid, tar_sprite) {		
		//определяем pic_url
		await lobby.update_players_cache_data(uid);
		const pic_url=lobby.players_cache[uid].pic_url;
		const t=await lobby.get_texture(pic_url);
		tar_sprite.texture = t;	
	}
	
	async set(msg_data) {
						
		//получаем pic_url из фб
		this.avatar.texture=PIXI.Texture.WHITE;
				
		await this.update_avatar(msg_data.uid, this.avatar);

		this.uid=msg_data.uid;
		this.tm = msg_data.tm;			
		this.hash = msg_data.hash;
		this.index = msg_data.index;
		
		if (msg_data.name.length > 15) msg_data.name = msg_data.name.substring(0, 15);	
		
		//бэкграунд сообщения в зависимости от длины
		if (msg_data.msg.length>20){
			this.msg_bcg.texture=gres.msg_bcg_long.texture
			this.msg_tm.x=470;		
		}else{
			this.msg_bcg.texture=gres.msg_bcg_short.texture
			this.msg_tm.x=300;		
		}
		
		make_text(this.name,msg_data.name,110);
		this.msg.text=msg_data.msg;		
		this.visible = true;		
		this.msg_tm.text = new Date(msg_data.tm).toLocaleString();
		
	}	
	
}

class feedback_record_class extends PIXI.Container {
	
	constructor() {
		
		super();		
		this.text=new PIXI.BitmapText('Николай: хорошая игра', {lineSpacing:50,fontName: 'mfont',fontSize: 20,align: 'left'}); 
		this.text.maxWidth=290;
		this.text.tint=0xFFFF00;
		
		this.name_text=new PIXI.BitmapText('Николай:', {fontName: 'mfont',fontSize: 20,align: 'left'}); 
		this.name_text.tint=0xFFFFFF;
		
		
		this.addChild(this.text,this.name_text)
	}		
	
	set(name, feedback_text){
		this.text.text=name+': '+feedback_text;
		this.name_text.text=name+':';
	
	}
	
	
}

anim2 = {
		
	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	empty_spr : {x:0, visible:false, ready:true, alpha:0},
		
	slot: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	
	
	
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
		return Math.sin(x*Math.PI*2);
	},
	
	easeInOutCubic(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	
	shake(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
		
		
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
				if (func === 'ease2back')
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

sound = {
	
	on : 1,
	
	play (snd_res) {
		
		if (this.on === 0)
			return;
		
		if (game_res.resources[snd_res]===undefined)
			return;
		
		game_res.resources[snd_res].sound.play();	
		
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
		let fb = await feedback.show(opp_data.uid);		
		if (fb[0] === 'sent') {
			let fb_id = irnd(0,50);			
			await fbs.ref("fb/"+opp_data.uid+"/"+fb_id).set([fb[1], firebase.database.ServerValue.TIMESTAMP, my_data.name]);
		
		}
		
		this.p_resolve("close");
				
	},

	close() {
		
		if (objects.big_message_cont.ready===false)
			return;

		anim2.add(objects.big_message_cont,{y:[objects.big_message_cont.sy,450]}, false, 0.4,'easeInBack');		
		this.p_resolve("close");			
	}

}

board_func={

	checker_to_move: "",
	target_point: 0,
	tex_2:0,
	tex_1:0,
	chk_type: 'quad',
	moves: [],
	
	move_end_callback(){},

	update_board() {

		this.target_point=0;

		//сначала скрываем все шашки
		objects.checkers.forEach((c)=>{	c.visible=false});

		var ind=0;
		for (var x=0;x<8;x++) {
			for (var y=0;y<8;y++) {

				if (g_board[y][x]!==0)
				{
					if (g_board[y][x]===2)
						objects.checkers[ind].texture=this.tex_2;

					if (g_board[y][x]===1)
						objects.checkers[ind].texture=this.tex_1;

					objects.checkers[ind].x=x*50+objects.board.x+10;
					objects.checkers[ind].y=y*50+objects.board.y+10;

					objects.checkers[ind].ix=x;
					objects.checkers[ind].iy=y;
					objects.checkers[ind].m_id=g_board[y][x];
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
			let tar_x = moves[i][0] * 50 + objects.board.x+10;
			let tar_y = moves[i][1] * 50 + objects.board.y+10;
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

		this.checker_to_move.tx=next_ix*50+objects.board.x+10;
		this.checker_to_move.ty=next_iy*50+objects.board.y+10;

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
	move_time_left : 0,
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
		
		//пока еще никто не подтвердил игру
		this.me_conf_play = 0;
		this.opp_conf_play = 0;
		
		//счетчик времени
		this.prv_tick_time=Date.now();
		this.move_time_left = 15;
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
		
		this.move_time_left--;
		const cur_time=Date.now();
		if ((cur_time-this.prv_tick_time)>5000||cur_time<this.prv_tick_time){
			game.stop('timer_error');			
			return;
		}			
		this.prv_tick_time=Date.now();
		
		
		if (this.move_time_left < 0 && my_turn === 1)	{
			
			if (this.me_conf_play === 1)
				game.stop('my_timeout');
			else
				game.stop('my_no_sync');
			
			return;
		}

		if (this.move_time_left < -5 && my_turn === 0) {
			
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
		if (this.move_time_left === 5) {
			objects.timer_text.tint=0xff0000;
			sound.play('clock');
		}

		//обновляем текст на экране
		objects.timer_text.text='0:'+this.move_time_left;
		//следующая секунда
		this.timer_id = setTimeout(function(){online_game.timer_tick()}, 1000);		
	},
	
	async send_message() {
		
		if (my_data.blocked || !this.chat_out){			
			return;
		}
		
		let msg_data = await feedback.show();
		
		if (msg_data[0] === 'sent') {			
			fbs.ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"CHAT",tm:Date.now(),data:msg_data[1]});	

		} else {			
			message.add(['Сообщение не отправлено','Message was not sent'][LANG]);
		}
		
	},
	
	reset_timer() {
		
		//обовляем время разъединения
		this.disconnect_time = 0;
		
		//перезапускаем таймер хода
		this.move_time_left = 37;
		objects.timer_text.text="0:"+this.move_time_left;
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
	},
	
	nochat(){
		
		this.chat_out=0;
		objects.send_message_button.alpha=0.3;
		message.add(['Соперник отключил чат','Chat disabled'][LANG]);
	},
		
	async stop (result) {
		
		let res_array = [
			['my_timeout',LOSE, ['Вы проиграли!\nУ вас закончилось время','You lose!\nOut of time!']],
			['opp_timeout',WIN , ['Вы выиграли!\nУ соперника закончилось время','You win!\nOpponent out of time']],
			['my_giveup' ,LOSE, ['Вы сдались!','You have given up!']],
			['timer_error' ,NOSYNC, ['Ошибка таймера!','Timer error!']],
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
		
		if ([opp_data.uid,my_data.uid].includes('Q7XisDGPW4V1RxPvavG8S22HqZVXGTDSvMgWgvFWtPQ='))
			fbs.ref('GENA_CASE').push({name:my_data.name,opp_name:opp_data.name,game_id,tm:Date.now(),result:result,info:'game_stop'})
		
		clearTimeout(this.timer_id);		
		
		let result_row = res_array.find( p => p[0] === result);
		let result_str = result_row[0];
		let result_number = result_row[1];
		let result_info = result_row[2][LANG];				
		let old_rating = my_data.rating;
		my_data.rating = this.calc_new_rating (my_data.rating, result_number);
		fbs.ref("players/"+my_data.uid+"/rating").set(my_data.rating);
		
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
			fbs.ref("players/"+[my_data.uid]+"/games").set(my_data.games);		

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
		
		opp_data.uid = 'BOT';
		
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

var make_text = function (obj, text, max_width) {

	let sum_v=0;
	let f_size=obj.fontSize;

	for (let i=0;i<text.length;i++) {

		let code_id=text.charCodeAt(i);
		let char_obj=game_res.resources.m2_font.bitmapFont.chars[code_id];
		if (char_obj===undefined) {
			char_obj=game_res.resources.m2_font.bitmapFont.chars[83];
			text = text.substring(0, i) + 'S' + text.substring(i + 1);
		}

		sum_v+=char_obj.xAdvance*f_size/64;
		if (sum_v>max_width) {
			obj.text =  text.substring(0,i-1);
			return;
		}
	}

	obj.text =  text;
}

game = {

	opponent : "",
	selected_checker : 0,
	checker_is_moving : 0,
	state : 0,

	activate(opponent, role) {

		my_role = role;
		
		objects.desktop.texture=gres.desktop.texture;
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.5,'linear');	
		
		this.state = 'on';

		if (role==="master") {
			my_turn=1;			
			board_func.tex_2=gres['chk_'+board_func.chk_type+'_2'].texture;
			board_func.tex_1=gres['chk_'+board_func.chk_type+'_1'].texture;
			message.add(['Вы играете красными шашками. Последний ход за соперником','You play with red checkers. The last move for the opponent'][LANG])
			
		} else {
			my_turn=0;
			board_func.tex_2=gres['chk_'+board_func.chk_type+'_1'].texture;
			board_func.tex_1=gres['chk_'+board_func.chk_type+'_2'].texture;
			message.add(['Вы играете белыми шашками. Последний ход за вами','You play with white checkers. The last move is yours'][LANG])
		}
		
							
		if (this.opponent !== "")
			this.opponent.clear();
		
		//если открыт лидерборд то закрываем его
		if (objects.lb_1_cont.visible===true)
			lb.close();
		
		//если открыт чат то закрываем его
		if (objects.chat_cont.visible)
			chat.close();
		
		//если открыт просмтотр игры то закрываем его
		if (game_watching.on)
			game_watching.close();		
		
		this.opponent = opponent;
		this.opponent.activate();
			
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

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		//проверяем что моя очередь
		if (my_turn === 0) {
			message.add(["Не твоя очередь","Not your turn"][LANG]);
			return;
		}

		//координаты указателя
		var mx = e.data.global.x/app.stage.scale.x;
		var my = e.data.global.y/app.stage.scale.y;

		//координаты указателя на игровой доске
		var new_x=Math.floor(8*(mx-objects.board.x-10)/400);
		var new_y=Math.floor(8*(my-objects.board.y-10)/400);

		//если выбрана новая шашка
		if (this.selected_checker===0)
		{
			//находим шашку по координатам
			this.selected_checker=board_func.get_checker_by_pos(new_x,new_y);

			if (this.selected_checker.m_id===my_checkers)
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

		if (this.selected_checker!==0)
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

		if ([opp_data.uid,my_data.uid].includes('Q7XisDGPW4V1RxPvavG8S22HqZVXGTDSvMgWgvFWtPQ='))
			fbs.ref('GENA_CASE').push({name:my_data.name,move_data,opp_name:opp_data.name,game_id,tm:Date.now(),info:'process_my_move1'})


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
			fbs.ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"MOVE",tm:Date.now(),data:{...move_data, board_state:0}})
		
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
		
		if ([opp_data.uid,my_data.uid].includes('Q7XisDGPW4V1RxPvavG8S22HqZVXGTDSvMgWgvFWtPQ='))
			fbs.ref('GENA_CASE').push({name:my_data.name,opp_name:opp_data.name,game_id,tm:Date.now(),info:'process_my_move2'})

	},

	async receive_move(move_data) {				
				
		if ([opp_data.uid,my_data.uid].includes('Q7XisDGPW4V1RxPvavG8S22HqZVXGTDSvMgWgvFWtPQ='))
			fbs.ref('GENA_CASE').push({name:my_data.name,move_data,opp_name:opp_data.name,game_id,tm:Date.now(),info:'rec_move1'})

				
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
		
		if ([opp_data.uid,my_data.uid].includes('Q7XisDGPW4V1RxPvavG8S22HqZVXGTDSvMgWgvFWtPQ='))
			fbs.ref('GENA_CASE').push({name:my_data.name,opp_name:opp_data.name,game_id,tm:Date.now(),info:'rec_move2'})


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
		
		//аватарки		
		objects.my_avatar.texture=card_data.avatar2.texture;
		objects.opp_avatar.texture=card_data.avatar1.texture;
		
		//имена
		make_text(objects.my_card_name,card_data.name2,150);
		make_text(objects.opp_card_name,card_data.name1,150);
		
		//рейтинги
		objects.my_card_rating.text=card_data.rating_text2.text;
		objects.opp_card_rating.text=card_data.rating_text1.text;
		
		let main_data=await fbs.ref("tables/"+this.game_id).once('value');
		main_data=main_data.val();
		

		board_func.tex_2=gres['chk_quad_2'].texture;
		board_func.tex_1=gres['chk_quad_1'].texture;		
		
		this.master_uid=main_data.master;
		this.slave_uid=main_data.slave;
		/*
		if (main_data.board){
			
			//проверяем если это законченая игра
			if(main_data.board==='fin'){			
				this.new_move('fin');
				return;
			} 			
			g_board = board_func.str_to_brd(main_data.board.f_str);
			if (this.master_uid!==main_data.board.uid)
				board_func.rotate_board(g_board);
		}
		else
			g_board = [[2,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[2,2,2,2,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1]];

		//обновляем доску
		board_func.update_board();
		*/		
		
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
		make_text(objects.my_card_name,my_data.name,150);
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

feedback = {
		
	rus_keys : [[50,176,80,215.07,'1'],[90,176,120,215.07,'2'],[130,176,160,215.07,'3'],[170,176,200,215.07,'4'],[210,176,240,215.07,'5'],[250,176,280,215.07,'6'],[290,176,320,215.07,'7'],[330,176,360,215.07,'8'],[370,176,400,215.07,'9'],[410,176,440,215.07,'0'],[491,176,541,215.07,'<'],[70,224.9,100,263.97,'Й'],[110,224.9,140,263.97,'Ц'],[150,224.9,180,263.97,'У'],[190,224.9,220,263.97,'К'],[230,224.9,260,263.97,'Е'],[270,224.9,300,263.97,'Н'],[310,224.9,340,263.97,'Г'],[350,224.9,380,263.97,'Ш'],[390,224.9,420,263.97,'Щ'],[430,224.9,460,263.97,'З'],[470,224.9,500,263.97,'Х'],[510,224.9,540,263.97,'Ъ'],[90,273.7,120,312.77,'Ф'],[130,273.7,160,312.77,'Ы'],[170,273.7,200,312.77,'В'],[210,273.7,240,312.77,'А'],[250,273.7,280,312.77,'П'],[290,273.7,320,312.77,'Р'],[330,273.7,360,312.77,'О'],[370,273.7,400,312.77,'Л'],[410,273.7,440,312.77,'Д'],[450,273.7,480,312.77,'Ж'],[490,273.7,520,312.77,'Э'],[70,322.6,100,361.67,'!'],[110,322.6,140,361.67,'Я'],[150,322.6,180,361.67,'Ч'],[190,322.6,220,361.67,'С'],[230,322.6,260,361.67,'М'],[270,322.6,300,361.67,'И'],[310,322.6,340,361.67,'Т'],[350,322.6,380,361.67,'Ь'],[390,322.6,420,361.67,'Б'],[430,322.6,460,361.67,'Ю'],[511,322.6,541,361.67,')'],[451,176,481,215.07,'?'],[30,371.4,180,410.47,'ЗАКРЫТЬ'],[190,371.4,420,410.47,'_'],[430,371.4,570,410.47,'ОТПРАВИТЬ'],[531,273.7,561,312.77,','],[471,322.6,501,361.67,'('],[30,273.7,80,312.77,'EN']],	
	eng_keys : [[50,176,80,215.07,'1'],[90,176,120,215.07,'2'],[130,176,160,215.07,'3'],[170,176,200,215.07,'4'],[210,176,240,215.07,'5'],[250,176,280,215.07,'6'],[290,176,320,215.07,'7'],[330,176,360,215.07,'8'],[370,176,400,215.07,'9'],[410,176,440,215.07,'0'],[491,176,541,215.07,'<'],[110,224.9,140,263.97,'Q'],[150,224.9,180,263.97,'W'],[190,224.9,220,263.97,'E'],[230,224.9,260,263.97,'R'],[270,224.9,300,263.97,'T'],[310,224.9,340,263.97,'Y'],[350,224.9,380,263.97,'U'],[390,224.9,420,263.97,'I'],[430,224.9,460,263.97,'O'],[470,224.9,500,263.97,'P'],[130,273.7,160,312.77,'A'],[170,273.7,200,312.77,'S'],[210,273.7,240,312.77,'D'],[250,273.7,280,312.77,'F'],[290,273.7,320,312.77,'G'],[330,273.7,360,312.77,'H'],[370,273.7,400,312.77,'J'],[410,273.7,440,312.77,'K'],[450,273.7,480,312.77,'L'],[471,322.6,501,361.67,'('],[70,322.6,100,361.67,'!'],[150,322.6,180,361.67,'Z'],[190,322.6,220,361.67,'X'],[230,322.6,260,361.67,'C'],[270,322.6,300,361.67,'V'],[310,322.6,340,361.67,'B'],[350,322.6,380,361.67,'N'],[390,322.6,420,361.67,'M'],[511,322.6,541,361.67,')'],[451,176,481,215.07,'?'],[30,371.4,180,410.47,'CLOSE'],[190,371.4,420,410.47,'_'],[430,371.4,570,410.47,'SEND'],[531,273.7,561,312.77,','],[30,273.7,80,312.77,'RU']],
	keyboard_layout : [],
	lang : '',
	p_resolve : 0,
	MAX_SYMBOLS : 50,
	uid:0,
	
	show(uid,max_symbols) {
		
		if (max_symbols)
			this.MAX_SYMBOLS=max_symbols
		else
			this.MAX_SYMBOLS=50
		
		this.set_keyboard_layout(['RU','EN'][LANG]);
				
		this.uid = uid;
		objects.feedback_msg.text ='';
		objects.feedback_control.text = `0/${this.MAX_SYMBOLS}`
				
		anim2.add(objects.feedback_cont,{y:[-400, objects.feedback_cont.sy]}, true, 0.4,'easeOutBack');	
		return new Promise(function(resolve, reject){					
			feedback.p_resolve = resolve;	  		  
		});
		
	},
	
	set_keyboard_layout(lang) {
		
		this.lang = lang;
		
		if (lang === 'RU') {
			this.keyboard_layout = this.rus_keys;
			objects.feedback_bcg.texture = gres.feedback_bcg_rus.texture;
		} 
		
		if (lang === 'EN') {
			this.keyboard_layout = this.eng_keys;
			objects.feedback_bcg.texture = gres.feedback_bcg_eng.texture;
		}
		
	},
	
	close() {
			
		anim2.add(objects.feedback_cont,{y:[objects.feedback_cont.y,450]}, false, 0.4,'easeInBack');		
		
	},
	
	response_message(uid, name) {

		
		objects.feedback_msg.text = name.split(' ')[0]+', ';	
		objects.feedback_control.text = `${objects.feedback_msg.text.length}/${feedback.MAX_SYMBOLS}`		
		
	},
	
	get_texture_for_key (key) {
		
		if (key === '<' || key === 'EN' || key === 'RU') return gres.hl_key1.texture;
		if (key === 'ЗАКРЫТЬ' || key === 'ОТПРАВИТЬ' || key === 'SEND' || key === 'CLOSE') return gres.hl_key2.texture;
		if (key === '_') return gres.hl_key3.texture;
		return gres.hl_key0.texture;
	},
	
	key_down(key) {
		
		
		if (objects.feedback_cont.visible === false || objects.feedback_cont.ready === false) return;
		
		key = key.toUpperCase();
		
		if (key === 'ESCAPE') key = {'RU':'ЗАКРЫТЬ','EN':'CLOSE'}[this.lang];			
		if (key === 'ENTER') key = {'RU':'ОТПРАВИТЬ','EN':'SEND'}[this.lang];	
		if (key === 'BACKSPACE') key = '<';
		if (key === ' ') key = '_';
			
		var result = this.keyboard_layout.find(k => {
			return k[4] === key
		})
		
		if (result === undefined) return;
		this.pointerdown(null,result)
		
	},
	
	pointerdown (e, inp_key) {
		
		let key = -1;
		let key_x = 0;
		let key_y = 0;		
		
		if (e !== null) {
			
			let mx = e.data.global.x/app.stage.scale.x - objects.feedback_cont.x;
			let my = e.data.global.y/app.stage.scale.y - objects.feedback_cont.y;;

			let margin = 5;
			for (let k of this.keyboard_layout) {			
				if (mx > k[0] - margin && mx <k[2] + margin  && my > k[1] - margin && my < k[3] + margin) {
					key = k[4];
					key_x = k[0];
					key_y = k[1];
					break;
				}
			}			
			
		} else {
			
			key = inp_key[4];
			key_x = inp_key[0];
			key_y = inp_key[1];			
		}
		
		
		
		//не нажата кнопка
		if (key === -1) return;			
				
		//подсвечиваем клавишу
		objects.hl_key.x = key_x - 10;
		objects.hl_key.y = key_y - 10;		
		objects.hl_key.texture = this.get_texture_for_key(key);
		anim2.add(objects.hl_key,{alpha:[1, 0]}, false, 0.5,'linear');
						
		if (key === '<') {
			objects.feedback_msg.text=objects.feedback_msg.text.slice(0, -1);
			key ='';
		}			
		
		
		if (key === 'EN' || key === 'RU') {
			this.set_keyboard_layout(key)
			return;	
		}	
		
		if (key === 'ЗАКРЫТЬ' || key === 'CLOSE') {
			this.close();
			this.p_resolve(['close','']);	
			key ='';
			sound.play('keypress');
			return;	
		}	
		
		if (key === 'ОТПРАВИТЬ' || key === 'SEND') {
			
			if (objects.feedback_msg.text === '') return;
			
			//если нашли ненормативную лексику то закрываем
			let mats =/шлю[хш]|п[еи]д[аеор]|суч?ка|г[ао]ндо|х[ую][ейяе]л?|жоп|соси|дроч|чмо|говн|дерьм|трах|секс|сосат|выеб|пизд|срал|уеб[аико]щ?|ебень?|ебу[ч]|ху[йия]|еба[нл]|дроч|еба[тш]|педик|[ъы]еба|ебну|ебл[аои]|ебись|сра[кч]|манда|еб[лн]я|ублюд|пис[юя]/i;		
			
			let text_no_spaces = objects.feedback_msg.text.replace(/ /g,'');
			if (text_no_spaces.match(mats)) {
				sound.play('locked');
				this.close();
				this.p_resolve(['close','']);	
				key ='';
				return;
			}
			
			this.close();
			this.p_resolve(['sent',objects.feedback_msg.text]);	
			key ='';
			sound.play('keypress');
			return;	
		}	
		
		
		
		if (objects.feedback_msg.text.length >= this.MAX_SYMBOLS)  {
			sound.play('locked');
			return;			
		}
		
		if (key === '_') {
			objects.feedback_msg.text += ' ';	
			key ='';
		}			
		

		sound.play('keypress');
		
		objects.feedback_msg.text += key;	
		objects.feedback_control.text = `${objects.feedback_msg.text.length}/${this.MAX_SYMBOLS}`		
		
	}
	
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
		await lobby.update_players_cache_data(uid);
		
		sound.play('receive_sticker');			
		anim2.add(objects.req_cont,{y:[-260, objects.req_cont.sy]}, true, 0.75,'easeOutElastic');
							
		//Отображаем  имя и фамилию в окне приглашения
		req_dialog._opp_data.name=lobby.players_cache[uid].name;
		make_text(objects.req_name,lobby.players_cache[uid].name,200);
		objects.req_rating.text=lobby.players_cache[uid].rating;
		req_dialog._opp_data.rating=lobby.players_cache[uid].rating;

		//throw "cut_string erroor";
		req_dialog._opp_data.uid=uid;
		objects.req_avatar.texture=await lobby.get_texture(lobby.players_cache[uid].pic_url);


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
		make_text(objects.opp_card_name,opp_data.name,150);
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

	rules_button_down () {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');
	
		anim2.add(objects.rules_cont,{y:[-450, objects.rules_cont.sy]}, true, 0.5,'easeOutBack');

	},

	rules_ok_down () {

		anim2.add(objects.rules_cont,{y:[objects.rules_cont.sy, -450]}, false, 0.5,'easeInBack');

	},

	pref_button_down () {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};
			
		sound.play('click');
		objects.pref_cont.change_name_pressed=false;
		anim2.add(objects.pref_cont,{y:[-200, objects.pref_cont.sy]}, true, 0.5,'easeOutBack');


	},

	pref_ok_down() {

		sound.play('close');
		anim2.add(objects.pref_cont,{y:[objects.pref_cont.sy, -200]}, false, 0.5,'easeInBack');

	},
		
	async pref_change_nick_down() {

		if(objects.pref_cont.change_name_pressed) return;
		objects.pref_cont.change_name_pressed=true;
				
		//провряем можно ли менять ник
		const tm=Date.now();
		const days_since_nick_change=~~((tm-my_data.nick_tm)/86400000);
		const days_befor_change=30-days_since_nick_change;
		const ln=days_befor_change%10;
		const opt=[0,5,6,7,8,9].includes(ln)*0+[2,3,4].includes(ln)*1+(ln===1)*2;
		const day_str=['дней','дня','день'][opt];

		if (days_befor_change>0){
			message.add([`Поменять ник можно через ${days_befor_change} ${day_str}`,`Wait ${days_befor_change} days`][LANG]);
			return;
		}
				
		const res=await ad.show2();
		if(res!=='ok'){
			message.add(["Какая-то ошибка при показе рекламы","Error when showing ad"][LANG]);
			//return;
		}
					
		const nick=await feedback.show('',15);
		if (nick[0]==='sent'){
			my_data.name=nick[1];
			fbs.ref("players/"+my_data.uid+"/name").set(my_data.name);
			make_text(objects.my_card_name,my_data.name,150);
			set_state({});
			message.add(['Имя изменено','Name has been changed'][LANG]);
			fbs.ref('players/'+my_data.uid+'/nick_tm').set(tm);
			my_data.nick_tm=tm;
		}

	},
		
	async chat_button_down() {
		
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		await this.close();
		
		chat.activate();
		
		
	},

	chk_type_sel(i) {

		if (i===0)
		{
			objects.chk_opt_frame.x=60;
			objects.chk_opt_frame.y=70;
			board_func.chk_type = 'quad';

		}

		if (i===1)
		{
			objects.chk_opt_frame.x=160;
			objects.chk_opt_frame.y=70;
			board_func.chk_type = 'star';

		}

		if (i===2)
		{
			objects.chk_opt_frame.x=260;
			objects.chk_opt_frame.y=70;
			board_func.chk_type = 'round';
		}
	},

	pref_sound_switched() {
		
		if (objects.pref_sound_switch.ready === false) {
			sound.play('locked');
			return;
		}
		
		if (sound.on === 1) {
			anim2.add(objects.pref_sound_switch,{x:[127, 91]}, true, 0.25,'linear');		
			sound.on = 0;
			return;
		}

		if (sound.on === 0){
			
			anim2.add(objects.pref_sound_switch,{x:[91, 127]}, true, 0.25,'linear');		
			sound.on = 1;	
			sound.play('close');			
			return;			
		}
		
	}

}

chat = {
	
	last_record_end : 0,
	drag : false,
	data:[],
	touch_y:0,
	drag_chat:false,
	drag_sx:0,
	drag_sy:-999,	
	recent_msg:[],
	moderation_mode:0,
	
	activate() {		

		anim2.add(objects.chat_cont,{alpha:[0, 1]}, true, 0.1,'linear');
		objects.desktop.texture=gres.desktop.texture;
		objects.chat_enter_button.visible=my_data.rating>1430;

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
			return
		}
		
		if (objects.feedback_cont.visible){			
			feedback.response_message(player_data.uid,player_data.name.text);			
		}else{			
			lobby.show_invite_dialog_from_chat(player_data.uid,player_data.name.text);			
		}
		
		
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
		let fb = await feedback.show(opp_data.uid,65);		
		if (fb[0] === 'sent') {			
			const hash=this.make_hash();
			const index=chat.get_oldest_index();
			fbs.ref(chat_path+'/'+index).set({uid:my_data.uid,name:my_data.name,msg:fb[1], tm:firebase.database.ServerValue.TIMESTAMP,index, hash});
		}	
		
	},
		
	close() {
		
		anim2.add(objects.chat_cont,{alpha:[1, 0]}, false, 0.1,'linear');
		if (objects.feedback_cont.visible === true)
			feedback.close();
	}
		
}

lb = {

	cards_pos: [[370,10],[380,70],[390,130],[380,190],[360,250],[330,310],[290,370]],
	last_update:0,

	show() {

		objects.desktop.texture=game_res.resources.lb_bcg.texture;
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

	update() {

		fbs.ref("players").orderByChild('rating').limitToLast(20).once('value').then((snapshot) => {


			raw_leaders_data = snapshot.val();
			if (raw_leaders_data===null) {
			  //console.log("Что-то не получилось получить данные о рейтингах");
			}
			else {

				var leaders = [];
				Object.keys(raw_leaders_data).forEach(uid => {
					
					if (raw_leaders_data[uid].name!=="" && raw_leaders_data[uid].name!=='')
						leaders.push([raw_leaders_data[uid].name, raw_leaders_data[uid].rating, raw_leaders_data[uid].pic_url, uid]);
				});


				leaders.sort(function(a, b) {	return b[1] - a[1];});

				//создаем загрузчик топа
				var loader = new PIXI.Loader();

				var len=Math.min(10,leaders.length);

				//загружаем тройку лучших
				for (let i=0;i<3;i++) {
					make_text(objects['lb_'+(i+1)+'_name'], leaders[i][0],180);					
					objects['lb_'+(i+1)+'_rating'].text = leaders[i][1];
					loader.add('leaders_avatar_'+i, leaders[i][2],{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE});
					
					objects['lb_'+(i+1)+'_cont'].interactive = true;
					objects['lb_'+(i+1)+'_cont'].pointerdown = function(){lobby.show_invite_dialog_from_lb(leaders[i][0],leaders[i][1],leaders[i][3])};
				};

				//загружаем остальных
				for (let i=3;i<10;i++) {
					let fname=leaders[i][0];

					make_text(objects.lb_cards[i-3].name,fname,180);

					objects.lb_cards[i-3].rating.text=leaders[i][1];
					objects.lb_cards[i-3].interactive = true;
					objects.lb_cards[i-3].pointerdown = function(){lobby.show_invite_dialog_from_lb(leaders[i][0],leaders[i][1],leaders[i][3])};
					loader.add('leaders_avatar_'+i, leaders[i][2],{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE});
				};

				loader.load();

				//показываем аватар как только он загрузился
				loader.onProgress.add((loader, resource) => {
					let lb_num=Number(resource.name.slice(-1));
					if (lb_num<3)
						objects['lb_'+(lb_num+1)+'_avatar'].texture=resource.texture
					else
						objects.lb_cards[lb_num-3].avatar.texture=resource.texture;
				});

			}

		});

	}

}

lobby={
	
	state_tint :{},
	_opp_data : {},
	players_cache : {},
	activated:false,
	rejected_invites:{},
	fb_cache:{},
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
			const room_desc=['КОМНАТА #','ROOM #'][LANG]+{'states':1,'states2':2,'states3':3,'states4':4,'states4':5}[room_name];
			this.sw_header.header_list=[['ДОБРО ПОЖАЛОВАТЬ В ИГРУ УГОЛКИ ОНЛАЙН!','WELCOME!!!'][LANG],room_desc]
			objects.lobby_header.text=this.sw_header.header_list[0];
			this.sw_header.time=Date.now()+12000;
			this.activated=true;
		}
		
		objects.desktop.texture=gres.lobby_bcg.texture;
		anim2.add(objects.lobby_cont,{alpha:[0, 1]}, true, 0.1,'linear');
		
		objects.cards_cont.x=0;
		
		//отключаем все карточки
		this.card_i=1;
		for(let i=1;i<objects.mini_cards.length;i++)
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
		if (state==="p" || state==="b")
			return;

		//это столы
		let tables = {};
		
		//это свободные игроки
		let single = {};

		//делаем дополнительный объект с игроками и расширяем id соперника
		let p_data = JSON.parse(JSON.stringify(players));
		
		//создаем массив свободных игроков
		for (let uid in players){	

			//обновляем кэш
			if (!this.players_cache[uid]) this.players_cache[uid]={};
			this.players_cache[uid].name=players[uid].name;	
			this.players_cache[uid].rating=players[uid].rating;	
			
			if (players[uid].state !== 'p' && players[uid].hidden === 0)
				single[uid] = players[uid].name;						
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
					this.update_existing_card({id:i, state:players[card_uid].state , rating:players[card_uid].rating});
			}
		}
		
		//определяем новых игроков которых нужно добавить
		new_single = {};		
		
		for (let p in single) {
			
			let found = 0;
			for(let i=1;i<objects.mini_cards.length;i++) {			
			
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

	get_state_texture(s) {
	
		switch(s) {

			case "o":
				return gres.mini_player_card.texture;
			break;

			case "b":
				return gres.mini_player_card_bot.texture;
			break;

			case "p":
				return gres.mini_player_card.texture;
			break;
			
			case "bot":
				return gres.mini_player_card.texture;
			break;

		}
	},
	
	place_table(params={uid1:0,uid2:0,name1: "XXX",name2: "XXX", rating1: 1400, rating2: 1400,game_id:0}) {
				
		for(let i=1;i<objects.mini_cards.length;i++) {

			//это если есть вакантная карточка
			if (objects.mini_cards[i].visible===false) {

				//устанавливаем цвет карточки в зависимости от состояния
				objects.mini_cards[i].bcg.texture=this.get_state_texture(params.state);
				objects.mini_cards[i].state=params.state;

				objects.mini_cards[i].type = "table";
				
				
				objects.mini_cards[i].bcg.texture = gres.mini_player_card_table.texture;
				
				//присваиваем карточке данные
				//objects.mini_cards[i].uid=params.uid;
				objects.mini_cards[i].uid1=params.uid1;
				objects.mini_cards[i].uid2=params.uid2;
												
				//убираем элементы свободного стола
				objects.mini_cards[i].rating_text.visible = false;
				objects.mini_cards[i].avatar.visible = false;
				//objects.mini_cards[i].avatar_frame.visible = false;
				objects.mini_cards[i].name_text.visible = false;

				//Включаем элементы стола 
				objects.mini_cards[i].table_rating_hl.visible=true;
				objects.mini_cards[i].rating_text1.visible = true;
				objects.mini_cards[i].rating_text2.visible = true;
				objects.mini_cards[i].avatar1.visible = true;
				objects.mini_cards[i].avatar2.visible = true;
				//objects.mini_cards[i].rating_bcg.visible = true;

				objects.mini_cards[i].rating_text1.text = params.rating1;
				objects.mini_cards[i].rating_text2.text = params.rating2;
				
				objects.mini_cards[i].name1 = params.name1;
				objects.mini_cards[i].name2 = params.name2;

				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid1, tar_obj:objects.mini_cards[i].avatar1});
				
				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid2, tar_obj:objects.mini_cards[i].avatar2});


				objects.mini_cards[i].visible=true;
				objects.mini_cards[i].game_id=params.game_id;

				break;
			}
		}
		
	},

	update_existing_card(params={id:0, state:"o" , rating:1400}) {

		//устанавливаем цвет карточки в зависимости от состояния(имя и аватар не поменялись)
		objects.mini_cards[params.id].bcg.texture=this.get_state_texture(params.state);
		objects.mini_cards[params.id].state=params.state;

		objects.mini_cards[params.id].rating=params.rating;
		objects.mini_cards[params.id].rating_text.text=params.rating;
		objects.mini_cards[params.id].visible=true;
	},

	place_new_card(params={uid:0, state: "o", name: "XXX", rating: rating}) {

		for(let i=1;i<objects.mini_cards.length;i++) {

			//это если есть вакантная карточка
			if (objects.mini_cards[i].visible===false) {

				//устанавливаем цвет карточки в зависимости от состояния
				objects.mini_cards[i].bcg.texture=this.get_state_texture(params.state);
				objects.mini_cards[i].state=params.state;

				objects.mini_cards[i].type = "single";


				//присваиваем карточке данные
				objects.mini_cards[i].uid=params.uid;

				//убираем элементы стола так как они не нужны
				objects.mini_cards[i].rating_text1.visible = false;
				objects.mini_cards[i].rating_text2.visible = false;
				objects.mini_cards[i].avatar1.visible = false;
				objects.mini_cards[i].avatar2.visible = false;
				objects.mini_cards[i].table_rating_hl.visible=false;
				
				//включаем элементы свободного стола
				objects.mini_cards[i].rating_text.visible = true;
				objects.mini_cards[i].avatar.visible = true;
				//objects.mini_cards[i].avatar_frame.visible = true;
				objects.mini_cards[i].name_text.visible = true;

				objects.mini_cards[i].name=params.name;
				make_text(objects.mini_cards[i].name_text,params.name,105);
				objects.mini_cards[i].rating=params.rating;
				objects.mini_cards[i].rating_text.text=params.rating;

				objects.mini_cards[i].visible=true;

				//стираем старые данные
				objects.mini_cards[i].avatar.texture=PIXI.Texture.EMPTY;

				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid, tar_obj:objects.mini_cards[i].avatar});

				//console.log(`новая карточка ${i} ${params.uid}`)
				return;
			}
		}

	},

	async get_texture(pic_url) {
		
		if (!pic_url) PIXI.Texture.WHITE;
		
		//меняем адрес который невозможно загрузить
		if (pic_url==="https://vk.com/images/camera_100.png")
			pic_url = "https://i.ibb.co/fpZ8tg2/vk.jpg";	
				
		if (PIXI.utils.TextureCache[pic_url]===undefined || PIXI.utils.TextureCache[pic_url].width===1) {
					
			let loader=new PIXI.Loader();
			loader.add('pic', pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});			
			await new Promise((resolve, reject)=> loader.load(resolve))	
			return loader.resources.pic.texture||PIXI.Texture.WHITE;

		}		
		
		return PIXI.utils.TextureCache[pic_url];		
	},
	
	async update_players_cache_data(uid){
		if (this.players_cache[uid]){
			if (!this.players_cache[uid].name){
				let t=await fbs.ref('players/' + uid + '/name').once('value');
				this.players_cache[uid].name=t.val()||'***';
			}
			
			if (!this.players_cache[uid].rating){
				let t=await fbs.ref('players/' + uid + '/rating').once('value');
				this.players_cache[uid].rating=t.val()||'***';
			}
				
			if (!this.players_cache[uid].pic_url){
				let t=await fbs.ref('players/' + uid + '/pic_url').once('value');
				this.players_cache[uid].pic_url=t.val()||null;
			}
			
		}else{
			
			this.players_cache[uid]={};
			let t=await fbs.ref('players/' + uid).once('value');
			t=t.val();
			this.players_cache[uid].name=t.name||'***';
			this.players_cache[uid].rating=t.rating||'***';
			this.players_cache[uid].pic_url=t.pic_url||'';
		}		
	},
		
	async load_avatar2 (params = {uid : 0, tar_obj : 0, card_id : 0}) {		

		await this.update_players_cache_data(params.uid);
		const pic_url=this.players_cache[params.uid].pic_url;
		const t=await this.get_texture(pic_url);
		params.tar_obj.texture=t;			
	},

	add_card_ai() {

		//убираем элементы стола так как они не нужны
		objects.mini_cards[0].rating_text1.visible = false;
		objects.mini_cards[0].rating_text2.visible = false;
		objects.mini_cards[0].avatar1.visible = false;
		objects.mini_cards[0].avatar2.visible = false;
		objects.mini_cards[0].table_rating_hl.visible = false;
		objects.mini_cards[0].bcg.texture=gres.mini_player_card_ai.texture;

		objects.mini_cards[0].visible=true;
		objects.mini_cards[0].uid="BOT";
		objects.mini_cards[0].name=objects.mini_cards[0].name_text.text=['Бот','Bot'][LANG];

		objects.mini_cards[0].rating=1400;		
		objects.mini_cards[0].rating_text.text = objects.mini_cards[0].rating;
		objects.mini_cards[0].avatar.texture=game_res.resources.pc_icon.texture;
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
		
		objects.td_cont.card=objects.mini_cards[card_id];
		
		objects.td_avatar1.texture = objects.mini_cards[card_id].avatar1.texture;
		objects.td_avatar2.texture = objects.mini_cards[card_id].avatar2.texture;
		
		objects.td_rating1.text = objects.mini_cards[card_id].rating_text1.text;
		objects.td_rating2.text = objects.mini_cards[card_id].rating_text2.text;
		
		make_text(objects.td_name1, objects.mini_cards[card_id].name1, 240);
		make_text(objects.td_name2, objects.mini_cards[card_id].name2, 240);
		
	},
	
	close_table_dialog() {
		sound.play('close');
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
		
		//копируем предварительные данные
		lobby._opp_data = {uid:objects.mini_cards[card_id].uid,name:objects.mini_cards[card_id].name,rating:objects.mini_cards[card_id].rating};
			
		
		this.show_feedbacks(lobby._opp_data.uid);
		
		objects.invite_button_title.text=['Пригласить','Send invite'][LANG];

		let invite_available = 	lobby._opp_data.uid !== my_data.uid;
		invite_available=invite_available && (objects.mini_cards[card_id].state==="o" || objects.mini_cards[card_id].state==="b");
		invite_available=invite_available || lobby._opp_data.uid==="BOT";
		invite_available=invite_available && lobby._opp_data.rating >= 50 && my_data.rating >= 50;
		
		//кнопка удаления комментариев
		objects.fb_delete_button.visible=my_data.uid===lobby._opp_data.uid;
		
		//если мы в списке игроков которые нас недавно отврегли
		if (this.rejected_invites[lobby._opp_data.uid] && Date.now()-this.rejected_invites[lobby._opp_data.uid]<60000) invite_available=false;

		//показыаем кнопку приглашения только если это допустимо
		objects.invite_button.visible=objects.invite_button_title.visible=invite_available;

		//заполняем карточу приглашения данными
		objects.invite_avatar.texture=objects.mini_cards[card_id].avatar.texture;
		make_text(objects.invite_name,lobby._opp_data.name,230);
		objects.invite_rating.text=objects.mini_cards[card_id].rating_text.text;
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
		await this.update_players_cache_data(uid);
			
		player_data.name=this.players_cache[uid].name;
		player_data.rating=this.players_cache[uid].rating;
		player_data.pic_url=this.players_cache[uid].pic_url;
		
		//копируем предварительные данные
		lobby._opp_data = {uid:player_data.uid,name:player_data.name,rating:player_data.rating};
											
		this.show_feedbacks(lobby._opp_data.uid);
		
		objects.invite_button_title.text=['Пригласить','Send invite'][LANG];

		let invite_available = 	lobby._opp_data.uid !== my_data.uid;
		invite_available=invite_available && lobby._opp_data.rating >= 50 && my_data.rating >= 50;
		
		//кнопка удаления комментариев
		objects.fb_delete_button.visible=false;
		
		//если мы в списке игроков которые нас недавно отврегли
		if (this.rejected_invites[lobby._opp_data.uid] && Date.now()-this.rejected_invites[lobby._opp_data.uid]<60000) invite_available=false;

		//показыаем кнопку приглашения только если это допустимо
		objects.invite_button.visible=objects.invite_button_title.visible=invite_available;

		//заполняем карточу приглашения данными
		objects.invite_avatar.texture=PIXI.utils.TextureCache[player_data.pic_url];
		make_text(objects.invite_name,lobby._opp_data.name,230);
		objects.invite_rating.text=player_data.rating;
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
	
	inst_message(data){
		
		//когда ничего не видно не принимаем сообщения
		if(!objects.lobby_cont.visible) return;
		
		sound.play('inst_msg');
		anim2.add(objects.inst_msg_cont,{alpha:[0, 1]},true,0.4,'linear',false);		
		const t=PIXI.utils.TextureCache[this.players_cache?.[data.uid]?.pic_url];
		objects.inst_msg_avatar.texture=t||PIXI.Texture.WHITE;
		make_text(objects.inst_msg_text,data.msg,300);
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

		sound.play('close');

		if (objects.invite_cont.visible===false)
			return;

		//отправляем сообщение что мы уже не заинтересованы в игре
		if (pending_player!=='') {
			fbs.ref("inbox/"+pending_player).set({sender:my_data.uid,message:"INV_REM",tm:Date.now()});
			pending_player='';
		}

		anim2.add(objects.invite_cont,{x:[objects.invite_cont.x, 800]}, false, 0.15,'linear');
	},

	async send_invite() {


		if (objects.invite_cont.ready===false || objects.invite_cont.visible===false)
			return;

		if (anim2.any_on() === true) {
			sound.play('locked');
			return
		};

		if (lobby._opp_data.uid==="BOT")
		{
			await this.close();
			
			//заполняем данные бот-оппонента
			make_text(objects.opp_card_name,lobby._opp_data.name,160);
			objects.opp_card_rating.text='1400';
			objects.opp_avatar.texture=objects.invite_avatar.texture;	
			
			game.activate(bot_game, 'master');
		}
		else
		{
			sound.play('click');
			objects.invite_button_title.text=['Ждите ответ..','Waiting...'][LANG];
			fbs.ref("inbox/"+lobby._opp_data.uid).set({sender:my_data.uid,message:"INV",tm:Date.now()});
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
		
		//сразу карточку оппонента
		make_text(objects.opp_card_name,opp_data.name,160);
		objects.opp_card_rating.text=opp_data.rating;
		objects.opp_avatar.texture=objects.invite_avatar.texture;		

		//закрываем меню и начинаем игру
		await lobby.close();
		game.activate(online_game, "master");
		
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
			my_data.pic_url = _player.getPhoto('medium');						
			my_data.name = my_data.name || this.get_random_name(my_data.uid);
			
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
			my_data.pic_url = _player.photo_100;
			
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
			let resp1 = await fetch("https://ipinfo.io/json");
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
			my_data.pic_url = _player.getPhoto('medium');
			
			if (my_data.pic_url === 'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/0/islands-retina-medium')
				my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';
			
			if (my_data.name === '')
				my_data.name = this.get_random_name(my_data.uid);
			
			//если английский яндекс до добавляем к имени страну
			let country_code = await this.get_country_code();
			my_data.name = my_data.name + ' (' + country_code + ')';			


			
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
			my_data.pic_url = _player.photo_100;
			
			return;			
		}
		
		if (game_platform === 'GOOGLE_PLAY') {	
		
			let country_code = await this.get_country_code();
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GP_');
			my_data.name = this.get_random_name(my_data.uid) + ' (' + country_code + ')';
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
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
			my_data.pic_url = player_data.avatar;	
			
		}
		
		if (game_platform === 'DEBUG') {		

			my_data.name = my_data.uid = 'debug' + prompt('Отладка. Введите ID', 100);
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';		
			return;
		}
		
		if (game_platform === 'CRAZYGAMES') {
			
			let country_code = await this.get_country_code();
			try {await this.load_script('https://sdk.crazygames.com/crazygames-sdk-v1.js')} catch (e) {alert(e)};			
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('CG_');
			my_data.name = this.get_random_name(my_data.uid) + ' (' + country_code + ')';
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
			let crazysdk = window.CrazyGames.CrazySDK.getInstance();
			crazysdk.init();			
			return;
		}
		
		if (game_platform === 'UNKNOWN') {
			
			//если не нашли платформу
			alert('Неизвестная платформа. Кто Вы?')
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('LS_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
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
			sound.on=1;	
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
	
	if (s.includes('yandex')) {
		
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
	
	if (s.includes('192.168')) {
			
		game_platform = 'DEBUG';	
		LANG = await language_dialog.show();
		return;	
	}	
	
	game_platform = 'UNKNOWN';	
	LANG = await language_dialog.show();
	
	

}

async function check_blocked(){
	
	//загружаем остальные данные из файербейса
	let _block_data = await fbs.ref("blocked/" + my_data.uid).once('value');
	let block_data = _block_data.val();
	
	if (block_data) my_data.blocked=1;
		
	
	
	
}

async function init_game_env(lang) {
				
	
	await define_platform_and_language();
	console.log(game_platform, LANG);
						
	//отображаем шкалу загрузки
	document.body.innerHTML='<style>html,body {margin: 0;padding: 0;height: 100%;	}body {display: flex;align-items: center;justify-content: center;background-color: rgba(41,41,41,1);flex-direction: column	}#m_progress {	  background: #1a1a1a;	  justify-content: flex-start;	  border-radius: 5px;	  align-items: center;	  position: relative;	  padding: 0 5px;	  display: none;	  height: 50px;	  width: 70%;	}	#m_bar {	  box-shadow: 0 1px 0 rgba(255, 255, 255, .5) inset;	  border-radius: 5px;	  background: rgb(119, 119, 119);	  height: 70%;	  width: 0%;	}	</style></div><div id="m_progress">  <div id="m_bar"></div></div>';
			
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
	document.body.appendChild(app.view);


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


	//загружаем аватарку игрока
	let loader=new PIXI.Loader();
	await new Promise(function(resolve, reject) {		
		loader.add("my_avatar", my_data.pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});
		loader.load(function(l,r) {	resolve(l)});
	});

	//устанавливаем фотки в попап и другие карточки
	objects.id_avatar.texture=objects.my_avatar.texture=loader.resources.my_avatar.texture;

	//это разные события
	document.addEventListener("visibilitychange", vis_change);
	window.addEventListener("wheel", (event) => {	
		//lobby.wheel_event(Math.sign(event.deltaY));
		chat.wheel_event(Math.sign(event.deltaY));
	});	
	window.addEventListener('keydown', function(event) { feedback.key_down(event.key)});

	
	//загружаем остальные данные из файербейса
	let _other_data = await fbs.ref("players/" + my_data.uid).once('value');
	let other_data = _other_data.val();

	//сервисное сообщение
	if(other_data && other_data.s_msg){
		message.add(other_data.s_msg);
		fbs.ref("players/"+my_data.uid+"/s_msg").remove();
	}

	my_data.rating = (other_data && other_data.rating) || 1400;
	my_data.games = (other_data && other_data.games) || 0;
	my_data.name = (other_data && other_data.name) || my_data.name;
	my_data.nick_tm = (other_data && other_data.nick_tm) || 0;
	
	
	//проверяем блокировку
	check_blocked();
		
	//устанавлием имена
	make_text(objects.id_name,my_data.name,150);
	make_text(objects.my_card_name,my_data.name,150);
			
	//номер комнаты
	let rooms_ranges = [0,1430,1600,99999]
	if (my_data.rating > rooms_ranges[0] && my_data.rating <= rooms_ranges[1])
		room_name= 'states';			
	if (my_data.rating > rooms_ranges[1] && my_data.rating <= rooms_ranges[2])
		room_name= 'states2';					
	if (my_data.rating > rooms_ranges[2] && my_data.rating <= rooms_ranges[3])
		room_name= 'states3';			
	
	//room_name= 'states4';	
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

	let git_src="https://akukamil.github.io/corners_gp/"
	//git_src=""

	//подпапка с ресурсами
	let lang_pack = ['RUS','ENG'][LANG];
	
	game_res=new PIXI.Loader();
	game_res.add("m2_font", git_src+"fonts/MS_Comic_Sans/font.fnt");

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
