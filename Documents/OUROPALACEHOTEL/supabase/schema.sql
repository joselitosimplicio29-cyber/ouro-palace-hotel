-- Rode este script no SQL Editor do seu projeto Supabase (supabase.com).
-- Cria a tabela que guarda todo o conteudo editavel do site e o bucket
-- de armazenamento publico para as fotos enviadas pelo painel admin.

create table if not exists site_content (
  id int primary key default 1,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

alter table site_content enable row level security;

-- Leitura publica (o site precisa ler o conteudo sem login).
create policy "site_content_public_read"
  on site_content for select
  using (true);

-- Apenas o backend (service role key) pode escrever; nenhuma policy de
-- insert/update para o público é criada de propósito.

insert into site_content (id, data)
values (
  1,
  jsonb_build_object(
    'rooms', jsonb_build_array(
      jsonb_build_object(
        'name', 'Suíte Master',
        'price', 150,
        'amenities', jsonb_build_array('1 - 2 pessoas', '1 cama de casal', 'WiFi gratuito'),
        'photo', 'assets/originais/camara varanda 2.jpeg'
      ),
      jsonb_build_object(
        'name', 'Suíte Standard',
        'price', 130,
        'amenities', jsonb_build_array('1 - 2 pessoas', '1 cama de casal', 'WiFi gratuito'),
        'photo', 'assets/originais/suite-standard.jpg'
      ),
      jsonb_build_object(
        'name', 'Suíte Single',
        'price', 100,
        'amenities', jsonb_build_array('1 pessoa', '1 cama de solteiro', 'WiFi gratuito'),
        'photo', 'assets/originais/suite-single.jpg'
      ),
      jsonb_build_object(
        'name', 'Suíte Double',
        'price', 180,
        'amenities', jsonb_build_array('1 - 2 pessoas', '2 camas de solteiro', 'Frigobar'),
        'photo', 'assets/originais/cama solteiro duplo.jpeg'
      )
    ),
    'about', jsonb_build_object(
      'paragraphs', jsonb_build_array(
        'O Ouro Palace Hotel teve o início de suas atividades em fevereiro de 2015. Com a chegada dos parques eólicos na região, começamos a atender aos primeiros clientes, funcionários da empresa DOIS A. Inicialmente, alugamos mensalmente, sem os devidos serviços de hotel. Após um ano e meio, tivemos o contrato de aluguel encerrado com a empresa.',
        'Na sequência, eu e minha esposa Sônia decidimos arriscar e começar a atender aos novos clientes como se fossemos uma pequena pousada — pequena porque, naquele momento, só tínhamos 4 quartos para oferecer os serviços. Inicialmente demos o nome de Pousada Bom Descanso, que permaneceu por longos 8 anos.',
        'Com o fluxo de pessoas aumentando, fomos obrigados a ampliar as acomodações. Aos poucos íamos construindo de 3 em 3 quartos, até chegar a um total de 24 suítes, sendo 17 suítes casal e 07 suítes de solteiro. Hoje o nome do nosso empreendimento é Ouro Palace Hotel. Graças ao nosso bom Deus, chegamos até aqui com muito trabalho e perseverança.',
        'Agradecemos aos nossos clientes e amigos, em especial ao amigo Hélio Diniz de BH, o principal impulsionador para iniciarmos as primeiras ampliações, às empresas GE e VESTAS que nos deram preferência para atendê-las, e a todos os nossos colaboradores, que se dedicam com excelência para atender a cada um com um sorriso e simpatia contagiante. Não temos um final para esta história, pois continuamos a trabalhar e escrever novos capítulos.'
      ),
      'gallery', jsonb_build_array(),
      'highlights', jsonb_build_array(
        'Fundado em fevereiro de 2015',
        'Mais de 10 anos de hospitalidade',
        '24 suítes: 17 casal e 07 solteiro',
        'Gestão familiar'
      )
    ),
    'gallery', jsonb_build_array(
      'assets/originais/quarto-casal-standard.jpg',
      'assets/originais/camara varanda 2.jpeg',
      'assets/originais/quarto com banheiro casal.jpeg',
      'assets/originais/cama solteiro duplo.jpeg',
      'assets/originais/cama solteiro 2.jpeg',
      'assets/originais/tv quarto solteiro duplo.jpeg',
      'assets/originais/correor.jpeg',
      'assets/originais/foto-1.jpg',
      'assets/originais/foto-7.jpg',
      'assets/originais/CASAL 1.jpeg',
      'assets/originais/CASAL 2.jpeg',
      'assets/originais/CASAL FOTO LADO.jpeg',
      'assets/originais/A NOITE QUARTO.jpeg',
      'assets/originais/CASA.jpeg'
    ),
    'video_url', null
  )
)
on conflict (id) do nothing;

-- Bucket publico para as fotos enviadas pelo painel admin.
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

create policy "site_images_public_read"
  on storage.objects for select
  using (bucket_id = 'site-images');
