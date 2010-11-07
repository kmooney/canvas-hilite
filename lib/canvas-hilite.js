function CodeCanvas(context) {
    this.context = context
    this.x = 0
    this.y = 0
    this.viewport = {start:0, end:25}
    this.font_size = 50 
    this.font_color = '#000'
    this.lines = []
    this.context.strokeStyle=this.font_color
    this.context.font= this.font_size+"px Monaco"
    this.emSize = context.measureText('m');
    var can = this
    
    this.context.canvas.addEventListener('keydown', function(e){ 
        if (e.keyCode == 8) {
            e.preventDefault();
            e.cancelBubble=true;
            can.x--
            if (can.x < 0) { 
               can.y --;
               if (can.y < 0) {
                   can.y=0;
               }
               can.x = can.lines[can.y].length;
            }
            else { 
                can.erase_char(can.y,can.x)
            }
            can.render()
        }
        return false;
    }, true)
    
    this.context.canvas.addEventListener('keypress', function(e){
        if (e.charCode == 13) { 
           can.y++;
           can.x=0;
        }
        else { 
            can.insert_string(can.y,can.x,String.fromCharCode(e.charCode))
            can.x++
        }
        can.render()
        return false;
    }, true)
}

CodeCanvas.prototype.erase_char = function(line, col) {
    if (this.lines[line] != undefined) {
        var start = this.lines[line].substr(0, col)
        var end =   this.lines[line].substr(col+1, this.lines[line].length)
        this.lines[line] = start+end;
    }
    return this.lines[line]
}
CodeCanvas.prototype.set_string = function(line, col, character) {
    if (this.lines[line] == undefined) {
        this.lines[line] = character
    }
    else {
        var start = this.lines[line].substr(0, col)
        var end = this.lines[line].substr(col + 1, this.lines[line].length)
        this.lines[line] = start + character + end
    }
    return this.lines[line]
}

CodeCanvas.prototype.insert_string = function(line, col, character) {
    if (this.lines[line] == undefined) {
        this.lines[line] = character;
    }
    else {
        var start = this.lines[line].substr(0, col)
        var end = this.lines[line].substr(col, this.lines[line].length)
        this.lines[line] = start + character + end
    }
    return this.lines[line]
}

CodeCanvas.prototype.render = function(){
    this.context.clearRect(0,0,this.context.canvas.width, this.context.canvas.height);
    for (var i = this.viewport.start; i < this.viewport.end; i++) {
        var y_coord = (i - this.viewport.start) * this.font_size * 1.5
        var x_coord = 10;
        if (this.lines[i] != undefined) { 
            this.context.fillText(this.lines[i], x_coord, y_coord + this.font_size + this.font_size/2)
        }
    }
    // draw the cursor
    console.log([this.x,this.y])
    console.log("letter is "+this.emSize.width+" wide")
    this.context.fillRect(
        this.x * this.emSize.width + (this.emSize.width*.05),
        this.y * this.font_size * 1.5, 
        this.emSize.width/8, 
        this.font_size+this.font_size/2
    );
    
}

// TODO - Figure out FontMetrics to know which line/col a user clicked on when clicking on the canvas.
// TODO - Canvas display loop

window.onload = function () { 
	// Each of the following examples create a canvas that is 320px wide by 200px high
	// Canvas is created at the viewport’s 10,50 coordinate
	var paper = document.getElementById('notepad').getContext('2d')
    var cc = new CodeCanvas(paper);
    // test
    cc.set_string(0,0,"this is a test")
    cc.insert_string(0,9,"nother")
    cc.insert_string(1,0,"Kevin was here.")
    cc.render()
}



