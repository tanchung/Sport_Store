import ProductService from '@services/Product/ProductServices'
import CategoryService from '@services/Category/CategoryServices'
import { Carousel } from 'antd'
import React, { useEffect, useState } from 'react'
import { HiOutlineArrowRight } from 'react-icons/hi2'
import { Link } from 'react-router-dom'

// Fallback banner images in case API fails
const fallbackBanners = [
  {
    id: 'fallback-1',
    name: 'Banner 1',
    imageUrl: 'https://theme.hstatic.net/200000278317/1001381785/14/slideshow_7.webp?v=112',
    alt: 'image1',
  },
  {
    id: 'fallback-2',
    name: 'Banner 2',
    imageUrl: 'https://cdn.hstatic.net/themes/200000278317/1001392934/14/slideshow_4.webp?v=23',
    alt: 'image2',
  },
  {
    id: 'fallback-3',
    name: 'Banner 3',
    imageUrl: 'https://theme.hstatic.net/200000278317/1001381785/14/slideshow_2.webp?v=112',
    alt: 'image3',
  },
  {
    id: 'fallback-4',
    name: 'Banner 4',
    imageUrl: 'https://theme.hstatic.net/200000278317/1001381785/14/slideshow_6.webp?v=112',
    alt: 'image4',
  },
]

const awards = [
  {
    img: 'https://d8um25gjecm9v.cloudfront.net/store-front-cms/award_1_fe08b5b4cd.svg',
    alt: 'Quality award',
  },
  {
    img: 'https://d8um25gjecm9v.cloudfront.net/store-front-cms/award_2_959a72e121.svg',
    alt: 'Quality award',
  },
  {
    img: 'https://d8um25gjecm9v.cloudfront.net/store-front-cms/award_3_298d151332.svg',
    alt: 'Quality award',
  },

  {
    img: 'https://d8um25gjecm9v.cloudfront.net/store-front-cms/award_4_271868f252.svg',
    alt: 'Customer satisfaction award',
  },
  {
    img: 'https://d8um25gjecm9v.cloudfront.net/store-front-cms/award_5_83186cbade.svg',
    alt: 'Innovation award',
  },
]
const imagePairs = [
  {
    img: 'https://theme.hstatic.net/200000278317/1001381785/14/instagram_8_large.jpg?v=112',
    alt: 'Promotion 1',
  },
  {
    img: '	https://theme.hstatic.net/200000278317/1001381785/14/instagram_1_large.jpg?v=112',
    alt: 'Promotion 2',
  },
]
const promotion = [
  {
    img: '	https://pos.nvncdn.com/3c8244-211061/bn/20250711_71Y7XV04.gif?v=1752210497',
    alt: 'Promotion 1',
  },
  {
    img: '	https://pos.nvncdn.com/3c8244-211061/bn/20250708_kimMr2Ec.gif?v=1751965341',
    alt: 'Promotion 2',
  },
  {
    img: 'https://pos.nvncdn.com/3c8244-211061/bn/20250708_C5OxI8Jv.gif?v=1751965405',
    alt: 'Promotion 3',
  },
  {
    img: 'https://pos.nvncdn.com/3c8244-211061/bn/20250708_jIAYGd5n.gif?v=1751965432',
    alt: 'Promotion 2',
  },
]

const action = [
  {
    number: '01',
    title: "NIKE",
    content:
      '',
    image:
      'https://pos.nvncdn.com/3c8244-211061/bn/20250708_C8j7lAVJ.gif?v=1751964340',
    alt: 'nike',
  },
  {
    number: '02',
    title: "ADIDAS",
    content:
      '',
    image:
      'https://pos.nvncdn.com/3c8244-211061/bn/20250708_auZTPI52.gif?v=1751964901',
    alt: 'nike',
  },
  {
    number: '03',
    title: "MIZUNO",
    content:
      '',
    image:
      'https://pos.nvncdn.com/3c8244-211061/bn/20250708_c4KhUczh.gif?v=1751964429',
    alt: 'nike',
  },
  {
    number: '05',
    title: "PUMA",
    content:
      '',
    image:
      '	https://pos.nvncdn.com/3c8244-211061/bn/20250708_Odj5VwGL.gif?v=1751964876',
    alt: 'nike',
  },
  {
    number: '06',
    title: "AKKA",
    content:
      '',
    image:
      '	https://pos.nvncdn.com/3c8244-211061/bn/20250708_vx5meO55.gif?v=1751964947',
    alt: 'nike',
  },
  {
    number: '07',
    title: "KAMITO",
    content:
      '',
    image:
      'https://pos.nvncdn.com/3c8244-211061/bn/20250708_ztzvdX3h.gif?v=1751965086',
    alt: 'nike',
  },
  {
    number: '08',
    title: "JOGARBOLA",
    content:
      '',
    image:
      'https://pos.nvncdn.com/3c8244-211061/bn/20250708_KWOtgGcU.gif?v=1751964988',
    alt: 'nike',
  },
]

const horizontalImages = [
  {
    img: 'https://d8um25gjecm9v.cloudfront.net/store-front-cms/New_2_51cba411a8.webp',
    alt: 'Product 1',
  },
  {
    img: 'https://d8um25gjecm9v.cloudfront.net/store-front-cms/Cautien_2_4aef1fd870.webp',
    alt: 'Product 2',
  },
  {
    img: 'https://d8um25gjecm9v.cloudfront.net/store-front-cms/Cautien_3_f42cd34695.webp',
    alt: 'Product 3',
  },
  {
    img: 'https://d8um25gjecm9v.cloudfront.net/store-front-cms/Cautien_5_18c522f89e.webp',
    alt: 'Product 4',
  },
  {
    img: 'https://d8um25gjecm9v.cloudfront.net/store-front-cms/New_2_51cba411a8.webp',
    alt: 'Product 5',
  },
  {
    img: 'https://d8um25gjecm9v.cloudfront.net/store-front-cms/Cautien_2_4aef1fd870.webp',
    alt: 'Product 6',
  },
  {
    img: 'https://d8um25gjecm9v.cloudfront.net/store-front-cms/Cautien_3_f42cd34695.webp',
    alt: 'Product 7',
  },
  {
    img: 'https://d8um25gjecm9v.cloudfront.net/store-front-cms/Cautien_5_18c522f89e.webp',
    alt: 'Product 8',
  },
  {
    img: 'https://d8um25gjecm9v.cloudfront.net/store-front-cms/New_2_51cba411a8.webp',
    alt: 'Product 9',
  },
  {
    img: 'https://d8um25gjecm9v.cloudfront.net/store-front-cms/Cautien_2_4aef1fd870.webp',
    alt: 'Product 10',
  },
]

const Home = () => {
  const [products, setProducts] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(false)
  const [bannersLoading, setBannersLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setBannersLoading(true)
        setError(null)

        // Fetch both products and collections simultaneously
        const [productsResponse, collectionsResponse] = await Promise.all([
          ProductService.getProducts({
            pageNumber: 1,
            pageSize: 10,
            sortBy: 'ProductName',
            sortAscending: true,
          }),
          CategoryService.getAllCollections().catch(err => {
            console.warn('Failed to fetch collections, using fallback banners:', err)
            return { success: false, data: fallbackBanners }
          })
        ])

        setProducts(productsResponse.products)

        // Use dynamic banners from API or fallback to static ones
        if (collectionsResponse.success && collectionsResponse.data.length > 0) {
          setBanners(collectionsResponse.data)
        } else {
          setBanners(fallbackBanners)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.')
        setBanners(fallbackBanners) // Use fallback banners on error
      } finally {
        setLoading(false)
        setBannersLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className='flex flex-col '>
      <div className='h-full w-full cursor-pointer'>
        {bannersLoading ? (
          <div className='h-145 w-full flex items-center justify-center bg-gray-200'>
            <div className='text-center'>
              <div className='h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500 mx-auto mb-4'></div>
              <p className='text-gray-600'>Đang tải banner...</p>
            </div>
          </div>
        ) : (
          <Carousel arrows infinite={true} autoplay={true} autoplaySpeed={3000}>
            {banners.map((banner, index) => (
              <div key={banner.id || index} className='relative overflow-hidden'>
                <Link to={`/bo-suu-tap/${banner.id}`} className='block'>
                  <img
                    src={banner.imageUrl}
                    alt={banner.alt || banner.name}
                    className='h-145 w-full '
                  />
                
                </Link>
              </div>
            ))}
          </Carousel>
        )}
      </div>
      <div className='grid grid-cols-5 bg-blue-900 md:grid-cols-5'>
        {awards.map((item, index) => (
          <div key={index} className='col-span-1'>
            <img src={item.img} alt={item.alt} className='h-25 w-90' />
          </div>
        ))}
      </div>

      <div className='relative flex w-full'>
        {imagePairs.map((item, index) => (
          <div key={index} className='w-1/2'>
            <img src={item.img} alt={item.alt} className='h-160 w-full' />
          </div>
        ))}
        <div className='absolute inset-0  left-5/10 flex flex-col items-center justify-center text-white'>
          <div className='rounded-lg bg-black/60 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 text-center text-cyan-400 shadow-lg shadow-cyan-500/30'>
            <h2 className='mb-4 text-8xl font-bold drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]'>
              Mới! <br />
              Mới! <br />
              Mới!
            </h2>
            <div className='flex w-80 cursor-pointer items-center justify-between text-xl'>
              <Link to='/san-pham/15' className='font-mono text-cyan-300 hover:text-cyan-100 transition-colors duration-300'>
                NIKE PHANTOM 6 LOW PRO TF
              </Link>
              <HiOutlineArrowRight className='mt-2 h-5 w-8 text-cyan-300 hover:text-cyan-100 transition-colors duration-300' />
            </div>
            <hr className='mt-1 w-80 border-cyan-400/50' />
          </div>

        </div>
      </div>

      <div className='mt-10'>
        <div className='flex w-full flex-col items-center justify-center p-10 text-blue-900'>
          <p className='text-5xl font-semibold'>Mời bạn sắm sửa</p>

          {/* Horizontal Scrollable Carousel */}
          <div className='scrollbar-hide mt-12 w-full overflow-x-auto'>
            {loading ? (
              <div className='flex h-64 items-center justify-center'>
                <div className='h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500'></div>
              </div>
            ) : error ? (
              <div className='flex h-64 items-center justify-center text-red-500'>
                {error}
              </div>
            ) : (
              <div className='flex min-w-max space-x-6 pb-4'>
                {products.length > 0
                  ? products.map(product => (
                    <Link
                      key={product.id}
                      to={`/san-pham/${product.id}`}
                      className='h-64 w-64 flex-none cursor-pointer overflow-hidden rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    >
                      <div className='relative h-64'>
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className='h-full w-full object-cover transition-transform duration-300 hover:scale-105'
                        />
                        {product.discountPercentage > 0 && (
                          <div className='absolute top-2 right-2 rounded-md bg-red-500 px-2 py-1 text-sm font-bold text-white'>
                            -{product.discountPercentage}%
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                  : // Fallback to static images if no products are available
                  horizontalImages.map((item, index) => (
                    <div
                      key={index}
                      className='h-64 w-64 flex-none cursor-pointer overflow-hidden rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    >
                      <img
                        src={item.img}
                        alt={item.alt}
                        className='h-full w-full object-cover transition-transform duration-300 hover:scale-105'
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className='flex w-full justify-center'>
            <hr className='mt-1 w-full rounded-full border-4 border-blue-900 font-bold' />
          </div>
        </div>
      </div>

      <div className='mt-10'>
        <div className='flex w-full justify-between p-10 text-blue-900'>
          <p className='text-5xl font-semibold'>
            Cầu tiến là <br /> bí quyết
          </p>
          <p className='p-4 text-xl italic'>
            Không ngừng nghiên cứu, ứng dụng công nghệ tiên tiến nhất<br /> để tạo ra những đôi giày đáp ứng mọi tiêu chuẩn khắt khe nhất của các cầu thủ chuyên nghiệp.
          </p>
        </div>
        <div className='grid grid-cols-4 overflow-x-hidden'>
          {promotion.map((item, index) => (
            <div
              key={index}
              className='overflow-hidden' // giữ ảnh phóng to không tràn ra ngoài
            >
              <img
                src={item.img}
                alt={item.alt}
                className='h-160 w-full object-cover transition-transform duration-300 hover:scale-105'
              />
            </div>
          ))}
        </div>

      </div>
      <div className='mt-5 mb-5 flex flex-col items-center justify-center'>
        <div className='mb-4 flex w-full justify-between p-10 text-blue-900'>
          <p className='text-5xl font-semibold'>
            Bứt tốc <br /> trên mọi sân cỏ 
          </p>
          <p className='p-4 text-xl italic'>
            Chỉ sau 1 năm ra mắt, dòng giày SpeedX đã chinh phục hàng nghìn cầu thủ  <br />{' '}
            với thiết kế siêu nhẹ, độ bám tối đa và phong cách đậm chất thể thao.
          </p>
        </div>
        {/* <div className='grid w-full grid-cols-3 gap-0 border-gray-200'> */}
          {/* {action.map((item, index) => {
            return (
              <div
                key={index}
                className={`flex flex-col p-6 ${index < 2 ? 'border-r border-gray-200' : ''}`}
              >
                <span className='mb-4 text-4xl font-bold text-blue-900'>
                  {item.number}
                </span>
                <h3 className='mb-4 text-xl font-semibold text-blue-900'>
                  {item.title}
                </h3>
                <p className='mb-6 text-blue-900'>{item.content}</p>
                <div className='mt-auto'>
                  <img
                    src={item.image}
                    alt={item.alt}
                    className='h-52 w-full rounded-lg object-cover'
                  />
                </div>
              </div>
            )
          })} */}
          <div className="grid grid-cols-2 gap-2 pl-1 pr-3">
  {/* Ảnh lớn bên trái */}
  <div className="relative rounded-lg overflow-hidden">
    <Link to={`/san-pham?brand=${encodeURIComponent(action[0].title)}`}>
      <img
        src={action[0].image}
        alt={action[0].alt}
        className="w-full h-full object-cover"
      />
      <span className="absolute bottom-4 left-4 text-white text-xl font-bold drop-shadow-lg">
        {action[0].title}
      </span>
    </Link>
  </div>

  {/* Ảnh nhỏ bên phải (grid 2x3) */}
  <div className="grid grid-cols-3 grid-rows-2 gap-4">
    {action.slice(1).map((item, index) => (
      <div key={index} className="relative rounded-lg overflow-hidden">
        <Link to={`/san-pham?brand=${encodeURIComponent(item.title)}`}>
          <img
            src={item.image}
            alt={item.alt}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-2 left-2 text-white text-sm font-bold drop-shadow-lg">
            {item.title}
          </span>
        </Link>
      </div>
    ))}
  </div>
</div>

        </div>
      </div>
    // </div>
  )
}

export default Home
