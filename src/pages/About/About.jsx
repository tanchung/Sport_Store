import React, { useState } from 'react'
import { RiDoubleQuotesL, RiDoubleQuotesR, RiCloseLine } from 'react-icons/ri'
import { Anchor } from 'antd'
import { BsPatchCheck } from 'react-icons/bs'

const { Link } = Anchor

const About = () => {
  const [selectedLeader, setSelectedLeader] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)

  const leaders = [
    {
      id: 1,
      name: 'Nguyễn Đức Tâm',
      title: 'Tổng Giám Đốc',
      bio: 'Với hơn 15 năm kinh nghiệm trong ngành thực phẩm dinh dưỡng, ông Tâm đã dẫn dắt MilkStore từ một startup nhỏ trở thành thương hiệu quốc gia được tin dùng.',
      image: 'https://res.cloudinary.com/dvxnesld4/image/upload/v1745754536/SnapBG.ai_1745754250789_qzcijf.png',
      achievements: [
        'Top 10 Doanh nhân tiêu biểu Việt Nam 2024',
        'Giải thưởng Đổi mới sáng tạo trong ngành thực phẩm',
        'Chứng nhận Doanh nghiệp phát triển bền vững',
      ],
    },
    {
      id: 2,
      name: 'Nguyễn Đức Duy',
      title: 'Giám Đốc Điều Hành Tài Chính',
      bio: 'Chuyên gia tài chính với bề dày kinh nghiệm tại các tập đoàn đa quốc gia, ông Duy đã xây dựng hệ thống quản trị tài chính vững mạnh cho MilkStore.',
      image:
        'https://res.cloudinary.com/dvxnesld4/image/upload/v1745487749/SnapBG.ai_1745487733643_cyudqc.png',
      achievements: [
        'CPA, CFA chứng chỉ quốc tế',
        '15+ năm kinh nghiệm quản lý tài chính',
        'Chuyên gia tái cấu trúc doanh nghiệp',
      ],
    },
    {
      id: 3,
      name: 'Lâm Họa My',
      title: 'Giám Đốc Điều Hành Sản Xuất',
      bio: 'Kỹ sư công nghệ thực phẩm với niềm đam mê chất lượng, đảm bảo mọi sản phẩm MilkStore đều đạt chuẩn an toàn và dinh dưỡng cao nhất.',
      image:
        'https://res.cloudinary.com/dvxnesld4/image/upload/v1745754536/SnapBG.ai_1745754250789_qzcijf.png',
      achievements: [
        'Tiến sĩ Công nghệ Thực phẩm',
        'Nguyên Giám đốc Nhà máy tại Vinamilk',
        'Chuyên gia hệ thống quản lý chất lượng',
      ],
    },

    {
      id: 4,
      name: 'Nguyễn Văn Hiếu',
      title: 'Giám Đốc Nhân Sự',
      bio: 'Chuyên gia nhân sự với hơn 10 năm kinh nghiệm, ông Hiếu đã xây dựng đội ngũ nhân sự vững mạnh và phát triển văn hóa doanh nghiệp tại MilkStore.',
      image:
        'https://res.cloudinary.com/dvxnesld4/image/upload/v1745751889/SnapBG.ai_1745749511397_asmfdc.png',
      achievements: [
        'Chuyên gia phát triển nguồn nhân lực',
        '10+ năm kinh nghiệm quản lý nhân sự',
        'Xây dựng văn hóa doanh nghiệp xuất sắc',
      ],
    },
  ]

  const handleLeaderClick = leader => {
    setSelectedLeader(leader)
    setPanelOpen(true)
    document.body.style.overflow = 'hidden' // Prevent scrolling when panel is open
  }

  const closePanel = () => {
    setPanelOpen(false)
    document.body.style.overflow = 'auto' // Re-enable scrolling
  }

  return (
    <div className='relative min-h-screen bg-gradient-to-br from-blue-50 to-white px-4 py-16 sm:px-6 lg:px-8'>
      {/* Dimmed overlay when panel is open */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 ${panelOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={closePanel}
      ></div>

      {/* Leadership Panel */}
      <div
        className={`fixed top-0 right-0 z-40 h-full w-full max-w-lg transform bg-white shadow-2xl transition-transform duration-300 ease-in-out ${panelOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedLeader && (
          <div className='h-full overflow-y-auto'>
            <div className='sticky top-0 flex items-center justify-between border-b bg-white p-4'>
              <h3 className='text-xl font-bold text-blue-800'>
                Thông tin chi tiết
              </h3>
              <button
                onClick={closePanel}
                className='rounded-full p-2 text-gray-500 hover:bg-gray-100'
              >
                <RiCloseLine className='text-2xl' />
              </button>
            </div>

            <div className='p-6'>
              <div className='mb-6 flex flex-col items-center'>
                <div className='mb-4 h-40 w-40 overflow-hidden rounded-full border-4 border-blue-100'>
                  <img
                    src={selectedLeader.image}
                    alt={selectedLeader.name}
                    className='h-full w-full object-cover'
                  />
                </div>
                <h2 className='text-2xl font-bold text-blue-800'>
                  {selectedLeader.name}
                </h2>
                <p className='text-blue-600 italic'>{selectedLeader.title}</p>
              </div>

              <div className='mb-6'>
                <h4 className='mb-3 text-lg font-semibold text-gray-800'>
                  Tiểu sử
                </h4>
                <p className='leading-relaxed text-gray-700'>
                  {selectedLeader.bio}
                </p>
              </div>

              <div>
                <h4 className='mb-3 text-lg font-semibold text-gray-800'>
                  Thành tựu nổi bật
                </h4>
                <ul className='space-y-3'>
                  {selectedLeader.achievements.map((achievement, index) => (
                    <li key={index} className='flex items-start'>
                      <div className='mt-1 mr-3 rounded-full bg-blue-100 p-1'>
                        <BsPatchCheck className='text-sm text-blue-600' />
                      </div>
                      <span className='text-gray-700'>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className='mt-8 border-t pt-6'>
                <p className='text-sm text-gray-500'>
                  "Sứ mệnh của chúng tôi là mang đến những sản phẩm dinh dưỡng
                  chất lượng nhất cho người Việt"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='mx-auto max-w-7xl'>
        {/* Header Section */}
        <div className='mb-16 text-center' id='header-section'>
          <h1 className='mb-3 text-4xl font-bold text-blue-800 md:text-5xl'>
            <span className='mb-4 block text-3xl'>Táo bạo. Quyết tâm.</span>
            <span className='block text-blue-600'>Luôn là chính mình.</span>
          </h1>
          <div className='mx-auto mt-6 h-1 w-24 bg-blue-500'></div>
        </div>
        {/* Ant Design Anchor Navigation */}
        {/* Ant Design Anchor Navigation - Improved Version */}
        <div className='top-0 z-10 mb-35 border-2 border-blue-900 bg-white/80 px-6 py-6 shadow-sm backdrop-blur-sm'>
          <Anchor
            affix={false}
            targetOffset={100}
            className='-mx-0.5 flex max-w-2xl flex-col space-y-4'
          >
            <div className='group flex items-center'>
              <span className='mr-4 ml-2 text-lg font-semibold text-black'>
                01
              </span>
              <Link
                href='#ceo-message'
                title='Thông điệp từ giám đốc'
                className='text-lg font-normal text-gray-800 transition-all duration-200 group-hover:text-xl group-hover:text-blue-600'
              />
              <div className='brder-t mr-4 ml-2 flex-1 border-gray-200'></div>
            </div>

            <div className='group flex items-center'>
              <span className='mr-4 ml-2 text-lg font-semibold text-black'>
                02
              </span>
              <Link
                href='#promise-section'
                title='Lời hứa của MilkStore'
                className='text-lg font-normal text-gray-800 transition-all duration-200 group-hover:text-xl group-hover:text-blue-600'
              />
              <hr />
            </div>

            <div className='group flex items-center'>
              <span className='mr-4 ml-2 text-lg font-semibold text-black'>
                03
              </span>
              <Link
                href='#leadership-section'
                title='Người dẫn đường'
                className='text-lg font-normal text-gray-800 transition-all duration-200 group-hover:text-xl group-hover:text-blue-600'
              />
            </div>
          </Anchor>
        </div>

        {/* Content Section - Thông điệp từ giám đốc */}
        <div className='flex flex-col gap-8 lg:flex-row' id='ceo-message'>
          {/* Image Section */}
          <div className='relative h-[670px] overflow-hidden shadow-2xl lg:w-1/2'>
            <img
              src='https://res.cloudinary.com/dvxnesld4/image/upload/v1745754536/SnapBG.ai_1745754250789_qzcijf.png'
              alt='CEO MilkStore'
              className='h-full w-full object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent'></div>
            <div className='absolute bottom-8 left-8 text-white'>
              <p className='text-sm'>Nguyễn Đức Tâm</p>
              <p className='text-xl font-medium'>Tổng giám đốc MilkStore</p>
            </div>
          </div>

          {/* Text Section */}
          <div className='bg-white p-8 shadow-lg lg:w-1/2'>
            <h2 className='text-3xl font-bold text-blue-800'>
              Thông điệp từ Tổng Giám Đốc
            </h2>
            <div className='mb-10 pt-6'>
              <p className='font-bold text-blue-800 italic'>Nguyễn Đức Tâm</p>
              <p className='text-blue-600'>
                Tổng giám đốc Công ty CP Sữa MilkStore
              </p>
              <hr className='mt-2 w-full text-blue-400' />
            </div>
            <div className='mb-8'>
              <div className='mb-2 flex items-center text-blue-700'>
                <RiDoubleQuotesL className='-mt-8 mr-2 text-5xl' />
                <p className='text-xl font-medium italic'>
                  Muốn có sản phẩm đi đầu thì phải luôn sáng tạo. Sáng tạo là
                  yếu tố sống còn.
                </p>
              </div>
            </div>

            <div className='space-y-6 text-gray-700'>
              <p className='leading-relaxed'>
                <span className='font-semibold text-blue-800'>Năm 2025</span>,
                chúng tôi bắt đầu hành trình với vô vàn khó khăn, nhưng mục tiêu
                luôn rõ ràng: để dinh dưỡng là quyền lợi của mọi trẻ em Việt
                Nam. Không vốn, không chuyên gia – chỉ có quyết tâm. MilkStore
                vượt qua mọi hoài nghi để chứng minh rằng người Việt có thể tạo
                ra sản phẩm dinh dưỡng chất lượng cho mọi nhà.
              </p>

              <p className='leading-relaxed'>
                Từ nhà máy đầu tiên khôi phục hoàn toàn bằng kỹ thuật Việt, đến
                trang trại và dây chuyền sản xuất đạt chứng nhận trung hoà
                carbon. Từ công thức phù hợp thể trạng trẻ em Việt, đến hơn 200
                sản phẩm cho mọi độ tuổi – mỗi sản phẩm là một lời hứa của
                MilkStore: bạn có thể chăm sóc tốt cho bản thân và người thân
                yêu.
              </p>

              <p className='leading-relaxed'>
                Chúng tôi hiểu rằng ngày mai luôn còn nhiều thử thách. Nhưng
                MilkStore sẽ không ngừng sáng tạo, không ngừng tiến bước – cùng
                bạn, và vì bạn.
              </p>
            </div>
          </div>
        </div>

        {/* Lời hứa của MilkStore */}
        <div id='promise-section'>
          <div className='mt-30 flex flex-col gap-8 lg:flex-row'>
            {/* Text Section */}
            <div className='bg-white p-8 shadow-lg lg:w-1/2'>
              <h2 className='mb-10 text-3xl font-bold text-blue-800'>
                Lời hứa của MilkStore
              </h2>

              <div className='space-y-6 text-gray-700'>
                <p className='leading-relaxed'>
                  <div className='flex items-center justify-between'>
                    <span className='font-bold text-blue-800 italic'>
                      Nói là làm
                    </span>
                    <span className='text-blue-800 italic'>01</span>
                  </div>
                  <hr className='mt-3 size-4 w-full' />
                  Tại MilkStore, minh bạch không chỉ là lời hứa. Chúng tôi hợp
                  tác với các đối tác toàn cầu để chọn lọc nguyên liệu an toàn,
                  đạt chuẩn quốc tế, cùng quy trình sản xuất tiên tiến. Mọi
                  quyết định về nguyên liệu đều vì bạn và những người bạn yêu
                  thương.
                </p>

                <p className='leading-relaxed'>
                  <div className='flex items-center justify-between'>
                    <span className='font-bold text-blue-800 italic'>
                      Cầu tiến không ngừng
                    </span>
                    <span className='text-blue-800 italic'>02</span>
                  </div>
                  <hr className='mt-3 size-4 w-full' />
                  Tại MilkStore, mỗi sản phẩm đều phải vượt qua các tiêu chuẩn
                  chất lượng nghiêm ngặt nhất trước khi đến tay bạn. Nhưng với
                  chúng tôi, tốt là chưa đủ. Chúng tôi luôn tự thử thách để ngày
                  mai tốt hơn hôm nay.
                </p>

                <p className='leading-relaxed'>
                  <div className='flex items-center justify-between'>
                    <span className='font-bold text-blue-800 italic'>
                      Thật lòng, không lòng vòng
                    </span>
                    <span className='text-blue-800 italic'>03</span>
                  </div>
                  <hr className='mt-3 size-4 w-full' />
                  Toàn bộ nội dung truyền thông của chúng tôi đều chân thật và
                  trực diện. Chúng tôi tự hào về chất lượng nguyên liệu của mình
                  nên sẽ luôn minh bạch với bạn. Thành phần nào không ghi trên
                  bao bì, nghĩa là không có trong sản phẩm.
                </p>
              </div>
            </div>

            {/* Image Section */}
            <div className='relative overflow-hidden shadow-2xl lg:w-1/2'>
              <img
                src={
                  'https://d8um25gjecm9v.cloudfront.net/store-front-cms/promise_cc9c5dc816.png'
                }
                alt='CEO MilkStore'
                className='h-full min-h-[400px] w-full object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent'></div>
            </div>
          </div>
        </div>

        {/* Người dẫn đường - Modified section */}
        <div className='mt-30 border-b-1' id='leadership-section'>
          <div className='mb-16 text-center'>
            <h2 className='mb-6 text-4xl font-bold text-blue-800'>
              Người dẫn đường
            </h2>
            <div className='mx-auto w-100 rounded-sm border-1 border-blue-800 p-2'>
              <div className='w-full rounded-sm bg-blue-800 p-1'>
                <span className='text-xl text-white'>BAN ĐIỀU HÀNH</span>
              </div>
            </div>
          </div>

          {/* CEO on top */}
          {/* <div className='mb-8 flex justify-center'>
            <div
              className='w-72 cursor-pointer p-4 text-center transition-colors hover:bg-blue-50 md:border-r-1 md:border-l-1 md:border-blue-800'
              onClick={() => handleLeaderClick(leaders[0])}
            >
              <h3 className='mb-2 text-xl font-bold text-blue-800'>
                <span className='text-lg font-normal'>Ông</span>{' '}
                {leaders[0].name}
              </h3>
              <p className='text-blue-800 italic'>{leaders[0].title}</p>
            </div>
          </div> */}

          {/* Directors below */}
          <div className='mb-3 grid grid-cols-1 md:grid-cols-4'>
            {leaders.slice(0).map((leader, idx, arr) => (
              <div
                key={leader.id}
                className={`cursor-pointer p-4 text-center transition-colors hover:bg-blue-50 ${idx === 0 ? 'md:border-l-1 md:border-blue-800' : ''} ${idx === arr.length - 1 ? 'md:border-r-1 md:border-blue-800' : ''} ${idx !== 0 ? 'md:border-l-1 md:border-blue-800' : ''}`}
                onClick={() => handleLeaderClick(leader)}
              >
                <h3 className='mb-2 text-xl font-bold text-blue-800'>
                  <span className='text-lg font-normal'>
                    {leader.id === 3 ? 'Bà' : 'Ông'} {/* Sửa thành Bà cho Lâm Họa My */}
                  </span>{' '}
                  {leader.name}
                </h3>
                <p className='text-blue-800 italic'>{leader.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        #leadership-section { border-bottom: 1px solid #1e40af !important; }
      `}</style>
    </div>
  )
}

export default About
