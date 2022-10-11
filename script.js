function isEmpty(obj) {
  return Object.getOwnPropertyNames(obj).length === 0;
}

$(document).ready(function () {
  $('#btnNew').on('click', newGame);
  $('#btnTeleport').on('click', teleportHero);
  $(document).on('keydown', move);
  $(document).on('click', mouseMove);
});

const heroTheme = 'HeroClass';
const villainTheme = 'VillainClass';

let n;
let t;
let k;
let Hero = {};
let Villains = [];
let end;
let stepNumber = 0;
let gameOver = true;
let success = false;
let arrowCoordinates = [];

function newGame() {
  n = Number.parseInt($('#txtN').val(), 10);

  t = !isNaN(Number.parseInt($('#txtT').val(), 10)) ? Number.parseInt($('#txtT').val(), 10) : 0;
  gameOver = false;
  Hero = {};
  Villains = [];
  stepNumber = Number.parseInt($('#txtL').val(), 10);

  $('#gameField').html(generateTable(n));
  if (!success) {
    $('#score_div').html(generateResult());
    k = 10;
  }
  success = false;

  TeleportListener();

  Hero = {
    id: 'JID',
    x: random(n, 1),
    y: random(n, 1),
    ds: 1,
    directionx: 0, //-1, 0, 1
    directiony: 0, //-1, 0, 1
    damage: false
  };
  PlaceIt(Hero.x, Hero.y, 'HeroID', heroTheme);
  setArrows();
  for (let i = 0; i < k; i++) {
    let rob_x = 1;
    let rob_y = 1;
    do {
      rob_x = random(n, 1);
      rob_y = random(n, 1);
    } while (samePositionWithHero({ x: rob_x, y: rob_y }, Hero, Villains));
    Villains[i] = {
      id: i,
      x: rob_x,
      y: rob_y,
      ds: 1,
      directionx: 0, //-1, 0, 1
      directiony: 0,
      damage: false
    };
    PlaceIt(Villains[i].x, Villains[i].y, 'Villain_' + (i + 1), villainTheme);
  }
  end = false;
}
function PlaceIt(x, y, id, classname) {
  let td = $(`#${y + '_' + x}`);
  if (!!td.length) {
    td.attr('_object', id);
    td.attr('class', classname);
  }
}
function setArrows() {
  arrowCoordinates = [
    { x: Hero.x + 1, y: Hero.y + 1, dx: 1, dy: 1 },
    { x: Hero.x + 1, y: Hero.y, dx: 1, dy: 0 },
    { x: Hero.x + 1, y: Hero.y - 1, dx: 1, dy: -1 },
    { x: Hero.x - 1, y: Hero.y + 1, dx: -1, dy: +1 },
    { x: Hero.x - 1, y: Hero.y, dx: -1, dy: 0 },
    { x: Hero.x - 1, y: Hero.y - 1, dx: -1, dy: -1 },
    { x: Hero.x, y: Hero.y - 1, dx: 0, dy: -1 },
    { x: Hero.x, y: Hero.y + 1, dx: 0, dy: 1 }
  ];

  $('.arrowClass').each(function (index) {
    $(this).removeAttr('_object');
    $(this).removeAttr('class');
  });

  for (let i = 0; i < arrowCoordinates.length; i++) {
    if ((Hero.x > 1 && Hero.x < n) || (Hero.y > 1 && Hero.y < n)) {
      const td = $(`#${arrowCoordinates[i].y + '_' + arrowCoordinates[i].x}`);
      if (!td.hasClass(villainTheme) && !td.hasClass('damaged')) {
        PlaceIt(arrowCoordinates[i].x, arrowCoordinates[i].y, 'arrow_' + i, 'arrowClass');
      }
    }
  }
}
function random(n, p) {
  p = !isNaN(p) ? p : 0;
  return Math.floor(Math.random() * 10 + p);
}
function samePositionWithHero(Villain_poz, Hero, Villains) {
  let ret = true;
  if (Villains.length > 0) {
    let i = 0;
    while (
      i < Villains.length &&
      !(
        (Villain_poz.x == Villains[i].x && Villain_poz.y == Villains[i].y) ||
        (Villain_poz.x == Hero.x && Villain_poz.y == Hero.y)
      )
    ) {
      i++;
    }
    if (!(i < Villains.length)) {
      return false;
    }
  } else {
    if (!(Villain_poz.x == Hero.x && Villain_poz.y == Hero.y)) {
      return false;
    }
  }

  return true;
}
function generateTable(n) {
  let s = '';
  for (let i = 1; i <= n; i++) {
    s += '<tr>';
    for (let j = 1; j <= n; j++) {
      s += '<td id="' + i + '_' + j + '"></td>';
    }
    s += '</tr>';
  }
  return s;
}
function generateResult() {
  let s = '';
  s += '<label class="steps">Number of Steps:</label>';
  s +=
    '<input type="text" id="txtL" placeHolder="Number of Steps:" value="' +
    stepNumber +
    '" disabled/>';
  return s;
}

function update(HeroTeleportPos = {}) {
  //Move Hero
  if (!isEmpty(Hero)) {
    if (!Hero.damage) {
      if (!isEmpty(HeroTeleportPos)) {
        Hero.x = HeroTeleportPos.x;
        Hero.y = HeroTeleportPos.y;
        HeroTeleportPos = {};
        stepNumber -= 100;
      } else {
        Hero.x += Hero.directionx * Hero.ds;
        Hero.y += Hero.directiony * Hero.ds;

        if (isCollisionVillains(Hero)) {
          Hero.damage = true;
        } else {
          stepNumber--;
        }
      }
    }
  }
  //Villains
  if (Villains.length > 0 && !Hero.damage) {
    for (let i = 0; i < Villains.length; i++) {
      const Villain = Villains[i];
      if (!Villain.damage) {
        let dx = Math.abs(Hero.x - Villain.x);
        let dy = Math.abs(Hero.y - Villain.y);
        let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        let dx1 = Math.abs(Hero.x - (Villain.x + Villain.ds));
        let dx2 = Math.abs(Hero.x - (Villain.x - Villain.ds));
        let dy1 = Math.abs(Hero.y - (Villain.y + Villain.ds));
        let dy2 = Math.abs(Hero.y - (Villain.y - Villain.ds));

        if (dx1 < dx2) {
          if (Villain.x < n) {
            Villain.directionx = 1;
          } else {
            Villain.directionx = 0;
          }
        } else if (dx1 > dx2) {
          if (Villain.x > 1) {
            Villain.directionx = -1;
          } else {
            Villain.directionx = 0;
          }
        } else if (dx1 == dx2) {
          Villain.directionx = 0;
        }
        if (dy1 < dy2) {
          if (Villain.y < n) {
            Villain.directiony = 1;
          } else {
            Villain.directiony = 0;
          }
        } else if (dy1 > dy2) {
          if (Villain.y > 1) {
            Villain.directiony = -1;
          } else {
            Villain.directiony = 0;
          }
        } else if (dy1 == dy2) {
          Villain.directiony = 0;
        }
        Villain.x += Villain.directionx * Villain.ds;
        Villain.y += Villain.directiony * Villain.ds;
        //Move Villain
        if (!Villains[i].damage) {
          if (!isCollisionVillains(Villain)) {
            Villains[i].x = Villain.x;
            Villains[i].y = Villain.y;
          } else {
            Villains[i].damage = true;
            stepNumber += 20;
          }
        }
        //Collision
        if (isCollision(Hero, [Villain])) {
          Hero.damage = true;
        }
      }
    }
  }
}
function draw() {
  //Hero
  if (!isEmpty(Hero)) {
    let Hero_a;
    let Hero_ax;
    let Hero_ay;
    let Hero_c = $('[_object="HeroID"]');
    if (!!Hero_c.length) {
      const Hero_obj = Hero_c;
      Hero_a = Hero_obj.attr('id').split('_');
      Hero_ax = Number.parseInt(Hero_a[1], 10);
      Hero_ay = Number.parseInt(Hero_a[0], 10);

      if (!Hero.damage) {
        Hero_obj.removeAttr('class');
        Hero_obj.removeAttr('_object');

        PlaceIt(Hero.x, Hero.y, 'HeroID', heroTheme);
        setArrows();
      } else {
        Hero_obj.removeAttr('class');
        Hero_obj.removeAttr('_object');

        PlaceIt(Hero.x, Hero.y, 'HeroID', heroTheme + ' damaged');

        game_over(e, 'Game over!');
      }
    }
  }

  //Villains
  if (Villains.length > 0 && !Hero.damage) {
    for (let i = 0; i < Villains.length; i++) {
      const Villain_c = $('[_object="Villain_' + (i + 1) + '"]');
      if (!!Villain_c.length) {
        const Villain = Villains[i];
        let Villain_a;
        let Villain_ax;
        let Villain_ay;
        const Villain_obj = Villain_c;
        Villain_a = Villain_obj.attr('id').split('_');
        Villain_ax = Number.parseInt(Villain_a[1], 10);
        Villain_ay = Number.parseInt(Villain_a[0], 10);

        if (!Villain.damage) {
          Villain_obj.removeAttr('class');
          Villain_obj.removeAttr('_object');

          PlaceIt(Villain.x, Villain.y, 'Villain_' + (i + 1), villainTheme);
        } else {
          Villain_obj.removeAttr('class');
          Villain_obj.removeAttr('_object');

          PlaceIt(Villain.x, Villain.y, 'Villain_' + (i + 1), villainTheme + ' damaged');
        }
      }
    }
  }
}
function move(e) {
  const keys = [37, 39, 38, 40];
  const keyCode = e.which;
  Hero.directionx = 0;
  Hero.directiony = 0;

  if (keys.indexOf(keyCode) !== -1) {
    if (keyCode === 37) {
      if (Hero.x > 1) {
        Hero.directionx = -1;
      } else {
        Hero.directionx = 0;
      }
    } else if (keyCode === 39) {
      if (Hero.x < n) {
        Hero.directionx = 1;
      } else {
        Hero.directionx = 0;
      }
    } else if (keyCode === 38) {
      if (Hero.y > 1) {
        Hero.directiony = -1;
      } else {
        Hero.directiony = 0;
      }
    } else if (keyCode === 40) {
      if (Hero.y < n) {
        Hero.directiony = 1;
      } else {
        Hero.directiony = 0;
      }
    }
    if (!gameOver) {
      update();
      draw();
      checkDamagedVillains(e);
      viewStepsInForm();
    }
    disableScrolling(e);
  }

  return true;
}

function mouseMove(e) {
  const obj = e.target;
  if (obj.className == 'arrowClass') {
    const _objectattr = obj.getAttribute('_object').split('_');
    const _objectID = Number.parseInt(_objectattr[1], 10);
    Hero.directionx = arrowCoordinates[_objectID].dx;
    Hero.directiony = arrowCoordinates[_objectID].dy;
    if (!gameOver) {
      update();
      draw();
      checkDamagedVillains(e);
      viewStepsInForm();
    }
    disableScrolling(e);
  }
}

function isCollision(r1, rt) {
  let i = 0;
  if (rt.length > 0) {
    while (i < rt.length && !(r1.x == rt[i].x && r1.y == rt[i].y)) {
      i++;
    }
    if (i < rt.length) {
      return true;
    }
  }
}
function isCollisionVillains(check_ob) {
  let j = 0;
  let damage_r = false;
  for (let i = 0; i < Villains.length; i++) {
    if (i != check_ob.id) {
      const Villain = Villains[i];
      if (check_ob.x == Villain.x && check_ob.y == Villain.y) {
        damage_r = true;
        if (!Villain.damage) Villains[i].damage = true;
      }
    }
  }
  return damage_r;
}

function teleportHero(e) {
  if (!gameOver) {
    let new_x = 1;
    let new_y = 1;
    if (t > 0) {
      do {
        new_x = random(n, 1);
        new_y = random(n, 1);
      } while (samePositionWithVillain({ x: new_x, y: new_y }));
    } else {
      new_x = random(n, 1);
      new_y = random(n, 1);
    }
    update({ x: new_x, y: new_y });
    draw();
    checkDamagedVillains(e);
    viewStepsInForm();
    t--;
    TeleportUpdate();
  }
}

function TeleportUpdate() {
  if (t >= 0) {
    //$('#btnTeleport').disabled = false;
    $('#btnTeleport').val('Teleport Number (' + t + ')');
  }
}

function samePositionWithVillain(New_poz) {
  let ret = true;
  if (Villains.length > 0) {
    let i = 0;
    while (
      i < Villains.length &&
      !(
        (Math.abs(New_poz.x - Villains[i].x) < 2 && Math.abs(New_poz.y - Villains[i].y) < 2) ||
        (New_poz.x == Hero.x && New_poz.y == Hero.y)
      )
    ) {
      i++;
    }
    if (!(i < Villains.length)) {
      return false;
    }
  }

  return true;
}

function TeleportListener() {
  if (t > 0) {
    //$('#btnTeleport').disabled = false;
    $('#btnTeleport').val('Teleport Number (' + t + ')');
  } else {
    //$('#btnTeleport').disabled = true;
  }
}

function viewStepsInForm() {
  const score_input = $('#txtL');
  if (!!score_input.length) score_input.val(stepNumber);
}

function game_over(e, text) {
  alert(text);
  gameOver = true;
  if (success) {
    k += 10;
    newGame();
  } else {
    return false;
  }
}

function disableScrolling(e) {
  e.preventDefault();
  return false;
}

function checkDamagedVillains(e) {
  if (Villains.length > 0 && !Hero.damage) {
    let i = 0;
    while (i < Villains.length && Villains[i].damage) {
      i++;
    }

    if (i == Villains.length) {
      success = true;
      game_over(e, 'You won!');
    }
  }
}

function pasteResult(result = 0) {
  const score_input = $('#txtL');
  if (!!score_input.length) score_input.val(result);
}
