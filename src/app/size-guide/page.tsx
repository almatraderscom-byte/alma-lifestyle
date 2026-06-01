import type { Metadata } from 'next';
import Link from 'next/link';
import { PageLayout } from '@/components/legal/PageLayout';

export const metadata: Metadata = {
  title: 'সাইজ গাইড | ALMA Lifestyle',
  description: 'ALMA Lifestyle পোশাকের সঠিক সাইজ বেছে নিতে আমাদের size guide দেখুন।',
};

export default function SizeGuidePage() {
  return (
    <PageLayout
      badge="সাহায্য"
      title="সাইজ গাইড"
      subtitle="সঠিক সাইজ বেছে নিন - একদম পারফেক্ট ফিটিং"
    >
      <h2>পুরুষদের পাঞ্জাবি</h2>
      <table>
        <thead>
          <tr>
            <th>সাইজ</th>
            <th>চেস্ট (ইঞ্চি)</th>
            <th>লম্বা (ইঞ্চি)</th>
            <th>কাঁধ (ইঞ্চি)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>38</td>
            <td>38-39</td>
            <td>40-41</td>
            <td>17.5</td>
          </tr>
          <tr>
            <td>40</td>
            <td>40-41</td>
            <td>41-42</td>
            <td>18</td>
          </tr>
          <tr>
            <td>42</td>
            <td>42-43</td>
            <td>42-43</td>
            <td>18.5</td>
          </tr>
          <tr>
            <td>44</td>
            <td>44-45</td>
            <td>43-44</td>
            <td>19</td>
          </tr>
          <tr>
            <td>46</td>
            <td>46-47</td>
            <td>44-45</td>
            <td>19.5</td>
          </tr>
          <tr>
            <td>48</td>
            <td>48-49</td>
            <td>45-46</td>
            <td>20</td>
          </tr>
        </tbody>
      </table>

      <h2>ছেলে শিশুদের পাঞ্জাবি</h2>
      <table>
        <thead>
          <tr>
            <th>সাইজ</th>
            <th>বয়স</th>
            <th>চেস্ট (ইঞ্চি)</th>
            <th>লম্বা (ইঞ্চি)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>16</td>
            <td>৩-৪ বছর</td>
            <td>22-23</td>
            <td>22-23</td>
          </tr>
          <tr>
            <td>20</td>
            <td>৫-৬ বছর</td>
            <td>24-25</td>
            <td>25-26</td>
          </tr>
          <tr>
            <td>24</td>
            <td>৭-৮ বছর</td>
            <td>26-27</td>
            <td>28-29</td>
          </tr>
          <tr>
            <td>28</td>
            <td>৯-১০ বছর</td>
            <td>28-29</td>
            <td>30-31</td>
          </tr>
          <tr>
            <td>32</td>
            <td>১১-১২ বছর</td>
            <td>30-31</td>
            <td>32-33</td>
          </tr>
          <tr>
            <td>36</td>
            <td>১৩-১৪ বছর</td>
            <td>32-33</td>
            <td>34-35</td>
          </tr>
        </tbody>
      </table>

      <h2>মহিলাদের পোশাক (Three Piece)</h2>
      <table>
        <thead>
          <tr>
            <th>সাইজ</th>
            <th>বুক (ইঞ্চি)</th>
            <th>কোমর (ইঞ্চি)</th>
            <th>হিপ (ইঞ্চি)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>S</td>
            <td>34-35</td>
            <td>28-29</td>
            <td>36-37</td>
          </tr>
          <tr>
            <td>M</td>
            <td>36-37</td>
            <td>30-31</td>
            <td>38-39</td>
          </tr>
          <tr>
            <td>L</td>
            <td>38-39</td>
            <td>32-33</td>
            <td>40-41</td>
          </tr>
          <tr>
            <td>XL</td>
            <td>40-41</td>
            <td>34-35</td>
            <td>42-43</td>
          </tr>
          <tr>
            <td>XXL</td>
            <td>42-43</td>
            <td>36-37</td>
            <td>44-45</td>
          </tr>
        </tbody>
      </table>

      <h2>মেয়ে শিশুদের পোশাক (Two Piece)</h2>
      <table>
        <thead>
          <tr>
            <th>সাইজ</th>
            <th>বয়স</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ছোট</td>
            <td>১-৫ বছর</td>
          </tr>
          <tr>
            <td>মাঝারি</td>
            <td>৬-৯ বছর</td>
          </tr>
          <tr>
            <td>বড়</td>
            <td>১০-১৪ বছর</td>
          </tr>
        </tbody>
      </table>

      <h2>সাইজ পরিমাপের নিয়ম</h2>
      <p>সঠিক সাইজ নির্ধারণ করতে measuring tape ব্যবহার করুন:</p>
      <ul>
        <li>
          <strong>চেস্ট/বুক:</strong> বুকের সবচেয়ে চওড়া অংশ measure করুন
        </li>
        <li>
          <strong>কোমর:</strong> Belt যেখানে থাকে সেই জায়গা measure করুন
        </li>
        <li>
          <strong>লম্বা:</strong> কাঁধ থেকে যতদূর চান সেই পর্যন্ত measure করুন
        </li>
        <li>
          <strong>হিপ:</strong> Hip এর সবচেয়ে চওড়া অংশ measure করুন
        </li>
      </ul>

      <h2>টিপস</h2>
      <ul>
        <li>আপনার সাধারণ পোশাকের সাইজ check করে নিন</li>
        <li>দুটি measurement এর মাঝামাঝি হলে large size নিন</li>
        <li>Body-fit পছন্দ হলে exact size নিন</li>
        <li>Loose fit চাইলে এক size বড় নিন</li>
        <li>Confused হলে আমাদের জিজ্ঞেস করুন: 01307-777733</li>
      </ul>

      <h2>সাইজ Exchange Policy</h2>
      <p>
        সাইজ মিল না খেলে ৭ দিনের মধ্যে exchange করতে পারবেন (Tag intact, unused condition এ)।
        বিস্তারিত <Link href="/refund">Refund Policy</Link> দেখুন।
      </p>
    </PageLayout>
  );
}
