-- auto-generated definition
create table ro.items
(
    id      serial   not null
        constraint item_pk
            primary key,
    name    char(40) not null,
    item_id integer
);

alter table ro.items
    owner to root;

create unique index item_id_uindex
    on ro.items (id);

