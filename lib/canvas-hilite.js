function RenderState() {
    this.continuous = false;
    this.name = 'Default';
    this.font_color = '#000';
    this.font_weight = 'normal';
    this.font_style = 'none';
    this.font_size = 12;
}

RenderState.copy = function(state) { 
    var r = new RenderState();
    for (var i in state) {
		if (state.hasOwnProperty(i)) {
        	r[i] = state[i];
		}
    }
    return r;
};

function CodeCanvas(canvas) {
    this.context = canvas.getContext('2d');
    this.x = 0;
    this.y = 0;

    this.viewport = {
        start: 0,
        end: 5
    };
    var render_state = null;
	var gutter_size = 0;
	var emSize = 0;
	var tabSize = 0;
    this.render_state = render_state = new RenderState();
    this.start_state = this.render_state;
    this.lines = [''];
    this.gutter_size = gutter_size = 15;
    this.context.fillStyle = render_state.font_color;
    this.context.font = render_state.font_size + "px Monaco";
    this.emSize = emSize = this.context.measureText('m');
    this.tabSize = tabSize = 4;
    this.line_height = render_state.font_size * 1.5;
    this.render_states = { };
    this.initial_states = { };
    
    // configure the viewport pased on the canvas height
    
    this.viewport.start = 0;
    this.viewport.end = Math.floor(canvas.height/(render_state.font_size * 1.5));
	var can = this;
    this.context.canvas.addEventListener('click', function(e) {
      var x = (e.clientX - canvas.offsetLeft);
      var y = (e.clientY - canvas.offsetTop);
      var line_number = Math.floor(y / (render_state.font_size * 1.5));
      var column_number = Math.floor ((x-gutter_size) / emSize.width);
      line_number = line_number + can.viewport.start;
      if (can.lines[line_number] === undefined) {
          line_number = can.lines.length - 1;
          column_number = can.lines[line_number].length;
      }
      if (column_number >= can.lines[line_number].length) {
          column_number = can.lines[line_number].length;
      }
      can.x = column_number;
      can.y = line_number;
      can.render();
    }, true);

    this.context.canvas.addEventListener('keypress', function(e) {
        e.preventDefault();
		switch(e.keyCode) {
			case 8:   // backspace
	            var line = can.y;
	            can.x = can.translate_coordinates([can.x,line])[0];
	            can.x--;
	            if (can.x < 0) {
	                can.y--;
	                if (can.y >= 0 && can.lines[can.y] !== undefined) {
	                    can.x = can.lines[can.y].length;
	                    can.lines[can.y] = can.lines[can.y]+can.lines[can.y+1];
	                    for (var i = can.y+1; i < can.lines.length; i++) {
	                        if (can.lines[i+1] !== undefined) {
	                            can.lines[i] = can.lines[i+1];
	                        }
	                    }
	                    delete can.lines[can.lines.length-1];
	                    can.lines.length--;
	                }
	                else {
	                    can.x = 0;
	                }
	            }
	            else {
	                can.erase_char(can.y, can.x);
	            }
	            if (can.y < 0) {
	                can.y = 0;
	            }
				break;
	        case 13:  // enter
	            var temp_string = '';
	            temp_string=can.lines[can.y].substring(0,can.x);
	            can.lines.splice(can.y+1, 0, can.lines[can.y].substring(can.x));
	            can.lines[can.y]=temp_string;
	            can.y++;
	            if (can.y == can.viewport.end) { 
	               can.viewport.start ++;
	               can.viewport.end ++;
	            }
	            can.x = 0;
				break;
			case 39:  // right arrow
	            can.x++;
				break;
	        case 37:   // left arrow
	            can.x = can.translate_coordinates([can.x,can.y])[0];
	            can.x--;
	            if (can.x < 0) {
	                can.x = 0;
	            }
				break;
			case 38:   // up arrow
	            can.y--;
	            if (can.y <= can.viewport.start && can.viewport.start !== 0) {
	                can.viewport.start --;
	                can.viewport.end --;
	            }
	            if (can.y < 0) {
	                can.y = 0;
	            }
				break;
	        case 40:   // down arrow
	            can.y++;
	            if (can.y >= can.viewport.end) {
	                can.viewport.start ++;
	                can.viewport.end ++;
	            }
	            if (can.y >= can.lines.length) { 
	                can.y = can.lines.length-1;
	            }
				break;
			default:
		        if (e.charCode !== 0) {
		            var coords = can.translate_coordinates([can.x,can.y]);
		            can.insert_string(coords[1], coords[0], String.fromCharCode(e.charCode));
		            can.x++;
		        }
				break;
		}
        can.render();
        return false;
    }, true);
}

CodeCanvas.prototype.translate_coordinates = function (coordinates) {    
    var y = Math.min(coordinates[1],this.lines.length-1);
    var c = [Math.min(coordinates[0],this.lines[y].length), y];
    return c;
};

CodeCanvas.prototype.erase_char = function(line, col) {
    if (this.lines[line] !== undefined) {
        var start = this.lines[line].substr(0, col);
        var end = this.lines[line].substr(col + 1, this.lines[line].length);
        this.lines[line] = start + end;
    }
    return this.lines[line];
};

CodeCanvas.prototype.set_string = function(line, col, character) {
    if (this.lines[line] === undefined) {
        this.lines[line] = character;
    }
    else {
        var start = this.lines[line].substr(0, col);
        var end = this.lines[line].substr(col + 1, this.lines[line].length);
        this.lines[line] = start + character + end;
    }
    return this.lines[line];
};

CodeCanvas.prototype.insert_string = function(line, col, character) {
    if (this.lines[line] === undefined) {
        this.lines[line] = character;
    }
    else {
        var start = this.lines[line].substr(0, col);
        var end = this.lines[line].substr(col, this.lines[line].length);
        this.lines[line] = start + character + end;
    }
    return this.lines[line];
};

CodeCanvas.prototype.render_text = function() {
    for (var i = this.viewport.start; i < this.viewport.end; i++) {
        var y_coord = (i - this.viewport.start) * this.render_state.font_size * 1.5;
        var x_coord = this.gutter_size;
        if (typeof this.lines[i] !== "undefined") {
            for (var j = 0; j < this.lines[i].length; j++) {
                if (typeof this.lines[i][j] !== "undefined") {
                    var coords = [x_coord + (this.emSize.width*j), Math.floor(y_coord + this.render_state.font_size + this.render_state.font_size / 2)];
                    var state_change = this.update_render_state(this.lines[i][j]);
                    var change_after = false;
                    if (typeof state_change == 'object') {
                        if (state_change[0].continuous === false) {
                            this.context.fillStyle = this.render_state.font_color;                        
                        }
                        else {
                            change_after = true;
                        }
                    }
                    this.context.fillText(this.lines[i][j], coords[0],coords[1]);
                    if (change_after)
                    {
                        this.context.fillStyle = this.render_state.font_color;
                    }
                }
            }
        }
    }
};

CodeCanvas.prototype.draw_cursor = function() {
    // draw the cursor
    var coords = this.translate_coordinates([this.x, this.y]);
    coords[1] = coords[1] - this.viewport.start;
    this.context.fillRect(
        this.gutter_size + (coords[0] *this.emSize.width),
        coords[1] * (this.render_state.font_size * 1.5),
        1, 
        this.render_state.font_size * 1.5 + (this.render_state.font_size / 4)
    );
};

CodeCanvas.prototype.render = function() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.render_state.font_size * 1.5 * (this.viewport.end+1));
    this.reset_state();
    this.render_text();
    this.draw_cursor();

};

CodeCanvas.prototype.register_state = function(match_code, render_state, toggle_state) {
    this.render_states[match_code] = {state: render_state, toggle: toggle_state};
    this.initial_states[match_code] = {state: RenderState.copy(render_state), toggle: toggle_state};
};

CodeCanvas.prototype.reset_state = function() {
    this.reset = true;
    this.render_state = new RenderState.copy(this.start_state);
    this.render_states = {};
    for (var s in this.initial_states) {
        this.render_states[s] = {state: RenderState.copy(this.initial_states[s].state), toggle: this.initial_states[s].toggle};
    }
};

CodeCanvas.prototype.update_render_state = function(match_code) {

    if (typeof this.render_states[match_code] !== "undefined") {
        var current_state = RenderState.copy(this.render_state);
        this.render_state = this.render_states[match_code].state;
        if (this.render_states[match_code].toggle) {
            this.render_states[match_code].state = current_state;
        }
        return [current_state,this.render_state];
        
    }
    if (this.reset) {
        this.reset = false;
        return [this.render_state, this.render_state];
    }
    return false;
};



