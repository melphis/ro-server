create table lots
(
    id integer not null
        constraint lots_pk
            primary key autoincrement,
    merchant_id integer not null,
    item_id integer not null,
    amount integer,
    price integer,
    refine integer,
    currency integer,
    insert_date integer
);

create unique index lots_id_uindex
    on lots (id);
