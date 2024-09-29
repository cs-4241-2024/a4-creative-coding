class Cell {
    constructor(color, x, y) {
        this.color = color;
        this.x = x;
        this.y = y;  
        this.spawn_time = spawn_counter;
    }
  
    activate(state) {}
  
    ping(state) {}
  }
  
  class ColoredCell extends Cell {
    constructor(color, x, y) {
        super(color, x, y);
    }
  
    activate(state) {}
  
    ping(state) {}
  }
  
  class CellChild {
    constructor(color, x, y) {
        this.color = color;
        this.x = x;
        this.y = y;  
        this.spawn_time = spawn_counter;
    }
  
    activate(state) {}
  
    ping(state) {}
  }
  
  class ComplexCell extends Cell {
    constructor(color, x, y, lifetime) {
        super(color, x, y);
        this.lifetime = lifetime;
    }
  
    activate(state) {
      state[this.x][this.y] = new ColoredCell(background, this.x, this.y);
    }
  
    ping(state) {
      this.lifetime -= 1;
      if(this.lifetime === 0) {
        this.activate(state);
      }
    }
  }
  
  class SpreadCell extends Cell {
    constructor(color, x, y, lifetime) {
        super(color, x, y);
        this.lifetime = lifetime;
        this.base_lifetime = lifetime;
    }
  
    activate(state) {
      for(let x_mod = -1; x_mod <= 1; x_mod++)
      {
        for(let y_mod = -1; y_mod <= 1; y_mod++)
        {
          if(x_mod == 0 && y_mod == 0) {
            continue;
          }
          let new_x = this.x + x_mod;
          let new_y = this.y + y_mod;
          if(new_x < dimensions && new_x >= 0 && new_y < dimensions && new_y >= 0)
          {
            if(state[new_x][new_y] instanceof ColoredCell)
            {
              state[new_x][new_y] = new SpreadCellChild(this.color, new_x, new_y, x_mod, y_mod);
            }
  
            if(state[new_x][new_y] instanceof SpreadCell)  {
              activate_queue.push(state[new_x][new_y]);
            }
          }
        }
      }
  
      this.lifetime = this.base_lifetime
    }
  
    ping(state) {
      this.lifetime -= 1;
      if(this.lifetime === 0) {
        this.activate(state);
      }
    }
  }
  
  class SpreadCellChild extends CellChild {
    constructor(color, x, y, x_mod, y_mod) {
        super(color, x, y);
        this.x_mod = x_mod;
        this.y_mod = y_mod;
    }
  
    activate(state) {
      state[this.x][this.y] = new ColoredCell(background, this.x, this.y);
  
      if(this.x + this.x_mod < dimensions && this.x + this.x_mod >= 0 && this.y + this.y_mod < dimensions && this.y + this.y_mod >= 0)
      {
        if(state[this.x + this.x_mod][this.y + this.y_mod] instanceof SpreadCell)  {
          activate_queue.push(state[this.x + this.x_mod][this.y + this.y_mod]);
        }
  
        if(state[this.x + this.x_mod][this.y + this.y_mod] instanceof ColoredCell)  {
          state[this.x + this.x_mod][this.y + this.y_mod] = new SpreadCellChild(this.color, this.x + this.x_mod, this.y + this.y_mod, this.x_mod, this.y_mod);
        }
  
        if(state[this.x + this.x_mod][this.y + this.y_mod] instanceof CellChild)  {
          let other_color = state[this.x + this.x_mod][this.y + this.y_mod].color;
          let red_component = other_color.substring(1, 3) > this.color.substring(1, 3) ? other_color.substring(1, 3) : this.color.substring(1, 3);
          let green_component = other_color.substring(3, 5) > this.color.substring(3, 5) ? other_color.substring(3, 5) : this.color.substring(3, 5);
          let blue_component = other_color.substring(5) > this.color.substring(5) ? other_color.substring(5) : this.color.substring(5);
          let final_color = '#' + red_component + green_component + blue_component;
          state[this.x + this.x_mod][this.y + this.y_mod] = new SpreadCellChild(final_color, this.x + this.x_mod, this.y + this.y_mod, this.x_mod, this.y_mod);
        }
  
      }
    }
  
    ping(state) {
      this.activate(state);
    }
  }