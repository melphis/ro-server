select count(id), max(price) as price, refine, currency, insert_date from ro.lots
where item_id = (select id from ro.items where item_id=1230)
group by price, refine, insert_date, currency
order by insert_date desc;
