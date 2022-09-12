CREATE TABLE IF NOT EXISTS freenom(
  id text not null,
  name text not null primary key,
  free tinyint not null,
  autoRenew tinyint not null,
  status text not null
)
