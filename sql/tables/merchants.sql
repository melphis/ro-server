create table merchants
(
    id          integer not null
        constraint merchants_pk
            primary key autoincrement,
    name        text    not null,
    pos_top     integer,
    pos_left    integer,
    currency    integer,
    last_update integer,
    shop_name   text    not null
);

create unique index merchants_id_uindex
    on merchants (id);

create unique index merchants_name_uindex
    on merchants (name);
