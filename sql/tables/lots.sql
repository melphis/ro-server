-- auto-generated definition
create table ro.lots
(
    id          serial    not null
        constraint lots_pk
            primary key,
    merchant_id integer   not null,
    item_id     integer   not null,
    amount      smallint  not null,
    price       integer   not null,
    refine      smallint  not null,
    currency    smallint  not null,
    insert_date timestamp not null,
    snap_id     integer
);

alter table ro.lots
    owner to root;

create unique index lots_id_uindex
    on ro.lots (id);

