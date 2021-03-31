create table items
(
    id      integer not null
        constraint items_pk
            primary key autoincrement,
    name    text    not null,
    item_id integer not null
);

create unique index items_id_uindex
    on items (id);

create unique index items_item_id_uindex
    on items (item_id);

