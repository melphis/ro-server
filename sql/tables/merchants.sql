-- auto-generated definition
create table merchants
(
    id          serial   not null
        constraint merchants_pk
            primary key,
    name        char(30) not null,
    pos_top     smallint not null,
    pos_left    smallint not null,
    currency    smallint not null,
    last_update time,
    shop_name   char(40) not null
);

alter table merchants
    owner to root;

create unique index merchants_name_uindex
    on merchants (name);

create unique index merchants_id_uindex
    on merchants (id);

