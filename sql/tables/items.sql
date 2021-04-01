-- auto-generated definition
create table items
(
    id      serial   not null
        constraint item_pk
            primary key,
    name    char(40) not null,
    item_id integer
);

alter table items
    owner to root;

create unique index item_id_uindex
    on items (id);

