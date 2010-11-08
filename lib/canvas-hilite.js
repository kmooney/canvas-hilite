function CodeCanvas(canvas) {
    this.context = canvas.getContext('2d')
    this.x = 0
    this.y = 0

    this.viewport = {
        start: 0,
        end: 25
    }
    
    this.font_size = font_size = 20
    this.font_color = '#000'
    this.lines = []
    this.gutter_size = gutter_size = 15
    this.context.strokeStyle = this.font_color
    this.context.font = this.font_size + "px Monaco"
    this.emSize = emSize = this.context.measureText('m');
    this.tabSize = tabSize = 4
    var can = this

    this.context.canvas.addEventListener('click', function(e) {
      var x = (e.clientX - canvas.offsetLeft)
      var y = (e.clientY - canvas.offsetTop)
      var line_number = Math.floor(y / (font_size * 1.5))
      var column_number = Math.floor ((x-gutter_size) / emSize.width)
      if (can.lines[line_number] == undefined) {
          line_number = can.lines.length - 1;
          column_number = can.lines[line_number].length;
      }
      if (column_number >= can.lines[line_number].length) {
          column_number = can.lines[line_number].length;
      }
      can.x = column_number
      can.y = line_number
      can.render()
    },true)

    this.context.canvas.addEventListener('keypress', function(e) {
        e.preventDefault()
        if (e.keyCode == 8) {
            can.x--
            if (can.x < 0) {
                can.y--;
                if (can.y < 0) {
                    can.y = 0;
                }
                if (can.lines[can.y] != undefined) {
                    can.x = can.lines[can.y].length
                }
                else {
                    can.x = 0;
                }
            }
            else {
                can.erase_char(can.y, can.x)
            }
        }
        else if (e.keyCode == 13) {
            can.y++;
            can.x = 0;
        }
        else if (e.keyCode == 39) {
            can.x++;
            if (can.x >= can.lines[can.y].length) {
                can.x = can.lines[can.y].length;
            }
        }
        else if (e.keyCode == 37) { 
            can.x--;
            if (can.x < 0) {
                can.x = 0;
            }
        }
        else if (e.keyCode == 38) {
            can.y--;
            if (can.y < 0) {
                can.y = 0;
            }
            if (can.x >= can.lines[can.y].length) {
                can.x = can.lines[can.y].length;
            }
        }
        else if (e.keyCode == 40) {
            can.y++;
            if (can.y >= can.lines.length) { 
                can.y = can.lines.length-1;
            }
            if (can.x >= can.lines[can.y].length) {
                can.x = can.lines[can.y].length;
            }
        }
        else if (e.charCode != 0) {
            can.insert_string(can.y, can.x, String.fromCharCode(e.charCode))
            can.x++
        }
        can.render()
        return false;
    }, true)
    
}

CodeCanvas.prototype.erase_char = function(line, col) {
    if (this.lines[line] != undefined) {
        var start = this.lines[line].substr(0, col)
        var end = this.lines[line].substr(col + 1, this.lines[line].length)
        this.lines[line] = start + end;
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

CodeCanvas.prototype.render = function() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    for (var i = this.viewport.start; i < this.viewport.end; i++) {
        var y_coord = (i - this.viewport.start) * this.font_size * 1.5
        var x_coord = this.gutter_size;
        if (this.lines[i] != undefined) {
            this.context.fillText(this.lines[i], x_coord, y_coord + this.font_size + this.font_size / 2)
        }
    }
    // draw the cursor
    var text_width = 0
    if (this.lines[this.y] != undefined) {
        text_width = this.context.measureText(this.lines[this.y]).width
    }

    this.context.fillRect(
        this.gutter_size + (this.x *this.emSize.width),
        this.y * (this.font_size * 1.5),
        1, 
        this.font_size * 1.5 + (this.font_size / 4)
    )

}

window.onload = function() {
    // Each of the following examples create a canvas that is 320px wide by 200px high
    // Canvas is created at the viewport’s 10,50 coordinate
    var paper = document.getElementById('notepad')
    var cc = new CodeCanvas(paper);
    // test
    cc.lines=['this', 'is','a','test of this functionality.', '', 'that was an empty line.']
    cc.render()
}



