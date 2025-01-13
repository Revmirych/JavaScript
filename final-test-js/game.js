// Оружие
class Weapon {
    constructor(name, attack, initDurability, range) {
        this.name = name;
        this.attack = attack;
        this.durability = initDurability;
        this.initDurability = initDurability;
        this.range = range;
    }

    takeDamage(damage) {
        this.durability = Math.max(0, this.durability - damage);
    }

    getDamage() {
        return this.isBroken() ? 0 :
            this.durability >= this.initDurability / 100 * 30 ? this.attack : this.attack / 2;
    }

    isBroken() {
        return this.durability <= 0;
    }
}

class Arm extends Weapon {
    constructor() {
        super('Рука', 1, Infinity, 1);
    }
}

class Bow extends Weapon {
    constructor() {
        super('Лук', 10, 200, 3);
    }
}

class Sword extends Weapon {
    constructor() {
        super('Меч', 25, 500, 1);
    }
}

class Knife extends Weapon {
    constructor() {
        super('Нож', 5, 300, 1);
    }
}

class Staff extends Weapon {
    constructor() {
        super('Посох', 8, 300, 2);
    }
}

class LongBow extends Bow {
    constructor() {
        super();
        this.name = 'Длинный лук';
        this.attack = 15;
        this.range = 4;
    }
}

class Axe extends Sword {
    constructor() {
        super();
        this.name = 'Секира';
        this.attack = 27;
        this.durability = 800;
    }
}

class StormStaff extends Weapon {
    constructor() {
        super();
        this.name = 'Посох Бури';
        this.attack = 10;
        this.range = 3;
    }
}

// Игрок
class Player {
    constructor(position, name) {
        this.position = position;
        this.name = name;
        this.life = 100;
        this.magic = 20;
        this.speed = 1;
        this.attack = 10;
        this.agility = 5;
        this.luck = 10;
        this.description = 'Игрок';
        this.weapon = new Arm();
        this.weaponsQueue = [ this.weapon ];
        this.turnNumber = 0;
    }

    getLuck() {
        return (Math.random() * 100 + this.luck) / 100;
    }

    getDamage(distance) {
        return distance > this.weapon.range ? 0 :
            (this.attack + this.weapon.getDamage()) * this.getLuck() / Math.max(distance, 1);
    }

    takeDamage(damage) {
        log(`${this.name} получает урон ${damage}`);
        this.life = Math.max(0, this.life - damage);
    }

    isDead() {
        return this.life <= 0;
    }

    moveLeft(distance) {
        this.position -= Math.min(this.speed, distance);
    }

    moveRight(distance) {
        this.position += Math.min(this.speed, distance);
    }

    move(distance) {
        if (distance < 0) {
            this.moveLeft(-distance);
        } else {
            this.moveRight(distance);
        }
    }

    isAttackBlocked() {
        return this.getLuck() > (100 - this.luck) / 100;
    }

    dodged() {
        return this.getLuck() > (100 - this.agility - this.speed * 3) / 100;
    }

    takeAttack(damage) {
        log(`${this.name} получает удар ${damage}`);
        if (this.isAttackBlocked()) {
            log(`${this.name} блокирует`);
            this.weapon.takeDamage(damage);
        } else if (!this.dodged()) {
            this.takeDamage(damage);
        } else {
            log(`${this.name} уклоняется`);
        }
    }

    checkWeapon() {
        if (this.weapon.isBroken()) {
            this.weapon = this.weaponsQueue.pop();
        }
    }

    tryAttack(enemy) {
        let distance = Math.abs(this.position - enemy.position);
        if (distance > this.weapon.range) {
            log(`${this.name} пытается атаковать, но недостаёт до ${enemy.name}`);
            return;
        }
        this.weapon.takeDamage(10 * this.getLuck());
        this.checkWeapon();
        let damage = this.getDamage(distance);
        if (distance === 0) {
            enemy.moveRight(1);
            damage *= 2;
        }
        enemy.takeAttack(damage);
        if (enemy.isDead()) {
            log(`${enemy.name} мёртв`);
        }
    }

    chooseEnemy(players) {
        return players.filter(player => player !== this)
            .reduce((a, e) => a === null || e.life < a.life ? e : a, null);
    }

    moveToEnemy(enemy) {
        this.move(enemy.position - this.position);
    }

    turn(players) {
        this.turnNumber++;
        log(`${this.name} ход № ${this.turnNumber}`);
        const enemy = this.chooseEnemy(players);
        log(`${this.name} нападает на ${enemy.name}`);
        this.moveToEnemy(enemy);
        this.tryAttack(enemy);
    }
}

// Основные персонажи

// Воин
class Warrior extends Player {
    constructor(position, name) {
        super(position, name);
        this.life = 120;
        this.initLife = 120;
        this.speed = 2;
        this.attack = 10;
        this.description = 'Воин';
        this.weapon = new Sword();
        this.weaponsQueue.push(new Knife());
    }

    takeDamage(damage) {
        if (this.life < this.initLife / 2 && this.getLuck() > 0.8) {
            const damageFromMagic = Math.min(damage, this.magic);
            this.magic -= damageFromMagic;
            if (damageFromMagic < damage) {
                super.takeDamage(damage - damageFromMagic);
            }
        } else {
            super.takeDamage(damage);
        }
    }
}

// Лучник
class Archer extends Player {
    constructor(position, name) {
        super(position, name);
        this.life = 80;
        this.magic = 35;
        this.attack = 5;
        this.agility = 10;
        this.description = 'Лучник';
        this.weapon = new Bow();
        this.weaponsQueue.push(new Knife());
    }

    getDamage(distance) {
        return distance > this.weapon.range ? 0 :
            (this.attack + this.weapon.getDamage()) * this.getLuck() * distance / Math.max(this.weapon.range, 1);
    }
}

// Маг
class Mage extends Player {
    constructor(position, name) {
        super(position, name);
        this.life = 70;
        this.magic = 100;
        this.initMagic = 100;
        this.attack = 5;
        this.agility = 8;
        this.description = 'Маг';
        this.weapon = new Staff();
        this.weaponsQueue.push(new Knife());
    }

    takeDamage(damage) {
        if (this.magic <= this.initMagic / 2) {
            super.takeDamage(damage);
            return;
        }

        super.takeDamage(damage / 2);
        this.magic = Math.max(0, this.magic - 12);
    }
}

// Усиленные персонажи

// Гном
class Dwarf extends Warrior {
    constructor(position, name) {
        super(position, name);
        this.life = 130;
        this.attack = 15;
        this.luck = 20;
        this.description = 'Гном';
        this.weapon = new Axe();
        this.weaponsQueue.push(new Knife());
        this.hits = 0;
    }

    takeDamage(damage) {
        if (++this.hits % 6 === 0 && this.getLuck() > 0.5) {
            super.takeDamage(damage/2);
            return;
        }
        super.takeDamage(damage);
    }
}

// Арбалетчик
class Crossbowman extends Archer {
    constructor(position, name) {
        super(position, name);
        this.life = 85;
        this.attack = 8;
        this.agility = 20;
        this.luck = 15;
        this.description = 'Арбалетчик';
        this.weapon = new LongBow();
        this.weaponsQueue.push(new Knife());
    }
}

// Демиург
class Demiurge extends Mage {
    constructor(position, name) {
        super(position, name);
        this.life = 80;
        this.magic = 120
        this.attack = 6;
        this.luck = 12;
        this.description = 'Демиург';
        this.weapon = new StormStaff();
        this.weaponsQueue.push(new Knife());
    }

    getDamage(distance) {
        return this.magic > 0 && this.getLuck() > 0.6 ? super.getDamage(distance) * 1.5 : super.getDamage(distance);
    }
}

function play(players) {
    let curPlayerIdx = 0;
    let alivePlayers = players.filter(p => !p.isDead());
    if (alivePlayers.length === 0) {
        return undefined;
    }
    while (alivePlayers.length > 1) {
        const player = alivePlayers[curPlayerIdx];
        player.turn(alivePlayers);
        alivePlayers = alivePlayers.filter(p => !p.isDead());
        if (player === alivePlayers[curPlayerIdx]) {
            curPlayerIdx++;
        }
        if (curPlayerIdx === alivePlayers.length) {
            curPlayerIdx = 0;
        }
    }
    log(`ПОБЕДИТЕЛЬ ${alivePlayers[0].name}`);
    return alivePlayers[0];
}

function log(text) {
    let el = document.createElement('div');
    el.innerHTML = text;
    document.getElementById('log').append(el);
}

function ready() {
    let player = new Player(1, 'name');
    console.log(player);

    let players = [
        new Warrior(0, "Алёша Попович"),
        new Archer(2, "Леголас"),
        new Mage(10, "Гендальф")
    ];

    play(players);
}

document.addEventListener("DOMContentLoaded", ready);
